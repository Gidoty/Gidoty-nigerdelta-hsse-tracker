"""Independent Python re-implementation of the report integrity scheme in
app/src/utils/integrity.js: canonical JSON serialization + SHA-256 hashing.

Shares no code with the JS app — it is a from-scratch reimplementation of
the same documented algorithm, used so an external reviewer (or the
manuscript's authors) can verify an exported report's hash without Node.js
or a browser. See validation/verify_export.py for the CLI that uses it,
and validation/make_synthetic.py / validation/tamper_test.py for the other
consumers.

Caveat on numbers: JS's JSON.stringify and Python's json.dumps both use a
shortest-round-trip decimal representation for floats, and both print
integers without a decimal point, so they agree for every numeric field
this app actually produces (GPS coordinates, accuracy, epoch timestamps,
counts). This module does not attempt to match JS number formatting for
arbitrary floats outside that range.
"""
import hashlib
import json
import math

HASH_ALGORITHM = 'SHA-256'
CANONICALIZATION_VERSION = 'hsse-c14n-v1'
LEGACY_CANONICALIZATION = 'legacy-v0-noncanonical'


def _js_number(value):
    """Format a number exactly as ECMAScript Number.prototype.toString /
    JSON.stringify does, so hashes match the JS app byte for byte."""
    if isinstance(value, int) and not isinstance(value, bool):
        value_f = float(value)
        if abs(value) < 10**21 and value_f == value:
            return str(value)
    value = float(value)
    r = repr(value)  # shortest round-trip digits, same digit string JS uses
    mant, _, exp = r.partition('e')
    neg = mant.startswith('-')
    mant = mant.lstrip('-')
    if '.' in mant:
        ip, fp = mant.split('.')
    else:
        ip, fp = mant, ''
    digits = (ip + fp).lstrip('0')
    point = len(ip) + (int(exp) if exp else 0)  # position of decimal point
    if ip.strip('0') == '':
        lead = len(fp) - len(fp.lstrip('0'))
        point = -lead + (int(exp) if exp else 0)
    digits = digits.rstrip('0') or '0'
    k = len(digits)
    n = point
    if k <= n <= 21:
        out = digits + '0' * (n - k)
    elif 0 < n <= 21:
        out = digits[:n] + '.' + digits[n:]
    elif -6 < n <= 0:
        out = '0.' + '0' * (-n) + digits
    else:
        e = n - 1
        sign = '+' if e >= 0 else '-'
        out = digits[0] + ('.' + digits[1:] if k > 1 else '') + 'e' + sign + str(abs(e))
    return ('-' if neg else '') + out


def canonicalize(value):
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, (int, float)):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            raise ValueError('Cannot canonicalize a non-finite number')
        if value == 0:
            return '0'
        return _js_number(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, list):
        return '[' + ','.join(canonicalize(v) for v in value) + ']'
    if isinstance(value, dict):
        keys = sorted(value.keys())
        return '{' + ','.join(f'{json.dumps(k, ensure_ascii=False)}:{canonicalize(value[k])}' for k in keys) + '}'
    raise TypeError(f'Cannot canonicalize value of type {type(value)}')


def sha256_hex(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def hash_photos(photos):
    return [sha256_hex(photo) for photo in (photos or [])]


def build_evidence_payload(report, photo_hashes):
    incident = report.get('incident', {})
    location = report.get('location', {})
    health = report.get('health', {})
    audit = report.get('audit', {})
    return {
        'incident': {
            'type': incident.get('type'),
            'subType': incident.get('subType'),
            'severity': incident.get('severity'),
            'duration': incident.get('duration'),
            'dateTime': incident.get('dateTime'),
            'description': incident.get('description', ''),
        },
        'location': {
            'gps': location.get('gps'),
            'display': location.get('display'),
            'state': location.get('state'),
            'lga': location.get('lga'),
            'landmark': location.get('landmark'),
        },
        'submittedAt': report.get('submittedAt'),
        'photoHashes': photo_hashes,
        'health': {
            'healthImpact': health.get('healthImpact'),
            'symptoms': health.get('symptoms', []),
            'affectedCount': health.get('affectedCount'),
        },
        'language': audit.get('language'),
        'consentVersion': audit.get('consentVersion'),
        'appVersion': audit.get('appVersion'),
    }


def seal_report(report, hashed_at):
    photo_hashes = hash_photos(report.get('evidence', {}).get('photos', []))
    payload = build_evidence_payload(report, photo_hashes)
    payload_hash = sha256_hex(canonicalize(payload))
    sealed = dict(report)
    sealed['integrity'] = {
        'algorithm': HASH_ALGORITHM,
        'canonicalization': CANONICALIZATION_VERSION,
        'payloadHash': payload_hash,
        'photoHashes': photo_hashes,
        'hashedAt': hashed_at,
        'eventCount': 0,
        'headEventHash': None,
    }
    sealed['events'] = []
    return sealed


def event_signing_payload(event):
    return {
        'prevEventHash': event['prevEventHash'],
        'type': event['type'],
        'timestamp': event['timestamp'],
        'data': event['data'],
    }


DEFAULT_REGULATORY_STATUS = {'nosdraNotified': False, 'nosdraNotifiedAt': None, 'cleanupStatus': 'pending'}


def derive_regulatory_status(events):
    state = dict(DEFAULT_REGULATORY_STATUS)
    for event in events or []:
        if event.get('type') == 'nosdra_notified':
            state = {**state, 'nosdraNotified': True, 'nosdraNotifiedAt': event.get('data', {}).get('notifiedAt')}
        elif event.get('type') == 'cleanup_status_changed':
            state = {**state, 'cleanupStatus': event.get('data', {}).get('status', state['cleanupStatus'])}
    return state


DEFAULT_EVIDENCE_LEVEL = 'community_observed'


def derive_evidence_level(events):
    """Mirror of deriveEvidenceLevel in integrity.js: an upgrade counts only
    if the logged event carries the reference the evidence-status rules
    require."""
    level = DEFAULT_EVIDENCE_LEVEL
    for event in events or []:
        if event.get('type') != 'evidence_status_changed':
            continue
        data = event.get('data') or {}
        if data.get('level') == 'community_observed':
            level = 'community_observed'
        elif data.get('level') == 'externally_referenced' and (data.get('externalReference') or {}).get('id'):
            level = 'externally_referenced'
        elif data.get('level') == 'independently_verified' and (data.get('verification') or {}).get('source') \
                and (data.get('verification') or {}).get('reference'):
            level = 'independently_verified'
    return level


def append_event(report, event_id, event_type, timestamp, data):
    events = list(report.get('events', []))
    prev_event_hash = events[-1]['eventHash'] if events else None
    event_hash = sha256_hex(canonicalize(event_signing_payload(
        {'prevEventHash': prev_event_hash, 'type': event_type, 'timestamp': timestamp, 'data': data}
    )))
    event = {
        'id': event_id,
        'type': event_type,
        'timestamp': timestamp,
        'prevEventHash': prev_event_hash,
        'eventHash': event_hash,
        'data': data,
    }
    updated = dict(report)
    updated['events'] = events + [event]
    if report.get('integrity'):
        updated['integrity'] = {**report['integrity'], 'eventCount': len(updated['events']), 'headEventHash': event_hash}
    return updated


def verify_report(report):
    integrity = report.get('integrity')
    if not integrity or integrity.get('canonicalization') == LEGACY_CANONICALIZATION:
        return {
            'payloadValid': None,
            'eventChainValid': None,
            'statusConsistent': None,
            'eventLogComplete': None,
            'details': {'reason': 'Legacy record — predates canonical hashing and cannot be re-verified.'},
        }

    photo_hashes = hash_photos(report.get('evidence', {}).get('photos', []))
    payload = build_evidence_payload(report, photo_hashes)
    recomputed_payload_hash = sha256_hex(canonicalize(payload))
    payload_valid = recomputed_payload_hash == integrity.get('payloadHash')

    event_chain_valid = True
    prev_event_hash = None
    events = report.get('events', [])
    for event in events:
        if event.get('prevEventHash') != prev_event_hash:
            event_chain_valid = False
            break
        recomputed_event_hash = sha256_hex(canonicalize(event_signing_payload(event)))
        if recomputed_event_hash != event.get('eventHash'):
            event_chain_valid = False
            break
        prev_event_hash = event['eventHash']

    regulatory = report.get('regulatory', {}) or {}
    derived_status = derive_regulatory_status(events)
    status_consistent = (
        derived_status['nosdraNotified'] == bool(regulatory.get('nosdraNotified'))
        and derived_status['nosdraNotifiedAt'] == regulatory.get('nosdraNotifiedAt')
        and derived_status['cleanupStatus'] == regulatory.get('cleanupStatus', 'pending')
        and derive_evidence_level(events) == ((report.get('evidenceStatus') or {}).get('level') or DEFAULT_EVIDENCE_LEVEL)
    )

    expected_event_count = len(events)
    expected_head_event_hash = events[-1]['eventHash'] if events else None
    event_log_complete = (
        (integrity.get('eventCount') or 0) == expected_event_count
        and integrity.get('headEventHash') == expected_head_event_hash
    )

    return {
        'payloadValid': payload_valid,
        'eventChainValid': event_chain_valid,
        'statusConsistent': status_consistent,
        'eventLogComplete': event_log_complete,
        'details': {
            'recomputedPayloadHash': recomputed_payload_hash,
            'storedPayloadHash': integrity.get('payloadHash'),
            'eventCount': len(events),
            'derivedRegulatoryStatus': derived_status,
            'storedEventCount': integrity.get('eventCount'),
            'storedHeadEventHash': integrity.get('headEventHash'),
        },
    }
