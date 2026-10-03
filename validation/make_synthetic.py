#!/usr/bin/env python3
"""Generate synthetic HSSE reports for device-testing and validation.

Produces 100 fabricated reports covering every incident type, severity,
and a spread of optional-field combinations (photos, health impact, GPS
vs. landmark-only location, anonymous vs. named contact). Every record
also carries 2-4 randomly chosen NOSDRA-notification / cleanup-status /
evidence-status events, so the event-chain and truncation-detection
tamper scenarios run against the full 100-record corpus rather than a
handful of records. Every report is marked
dataClass: "developer_test" and uses fictional coordinates and place names
inside the Niger Delta's general bounding box — none of it describes a
real incident, person, or location, and it must never be treated as real
report data (see docs/AUTHOR_ACTION_REQUIRED.md).

Standard library only, fixed random seed for reproducibility. Run:
    python3 validation/make_synthetic.py

Consumed by validation/tamper_test.py and the manual device trials in
validation/offline_test.md (load with ?mode=test and import into the app,
or use directly as fixtures for the tamper-detection check).
"""
import json
import os
import random
import uuid
from datetime import datetime, timedelta, timezone

from canonical import append_event, derive_regulatory_status, seal_report
from synthetic_png import make_png_data_url

SEED = 20260101
RECORD_COUNT = 100

INCIDENT_TYPES = {
    'oil_spill': ['pipeline_leak', 'wellhead_blowout', 'tank_overflow', 'bunkering_theft', 'unknown_source'],
    'gas_flare': ['routine_flare', 'emergency_flare', 'flare_near_community', 'unknown_flare'],
    'water_pollution': ['creek_river', 'groundwater_well', 'coastal_estuary'],
    'air_pollution': ['flare_smoke', 'chemical_smell', 'black_soot', 'acid_rain'],
    'pipeline_fire': ['active_fire', 'recently_extinguished'],
    'chemical_spill': ['unknown_substance', 'known_chemical'],
    'health_emergency': ['mass_illness', 'skin_conditions', 'respiratory', 'contaminated_water'],
    'other': [None],
}
SEVERITY_LEVELS = ['minor', 'moderate', 'serious', 'critical']
DURATION_OPTIONS = ['just_happened', 'today', 'days', 'ongoing', 'unknown']
AFFECTED_COUNT_OPTIONS = ['1-5', '6-20', '21-100', '100+', 'unknown', None]
SYMPTOM_OPTIONS = ['breathing', 'skin', 'eyes', 'headache', 'nausea', 'smell', 'vulnerable', 'animals', 'crops']
NIGER_DELTA_STATES = ['Bayelsa', 'Rivers', 'Delta', 'Akwa Ibom', 'Cross River', 'Edo', 'Ondo', 'Imo', 'Abia']
CLEANUP_STATUSES = ['pending', 'in_progress', 'completed']

# Rough Niger Delta bounding box, used only to place fictional points —
# these are not real GPS captures of any actual incident.
LAT_RANGE = (4.2, 5.9)
LNG_RANGE = (5.4, 7.8)


def fictional_datetime(rng, start, end):
    delta = end - start
    offset = timedelta(seconds=rng.randint(0, int(delta.total_seconds())))
    return start + offset


def build_report(rng, index):
    incident_type = list(INCIDENT_TYPES.keys())[index % len(INCIDENT_TYPES)]
    sub_types = INCIDENT_TYPES[incident_type]
    sub_type = rng.choice(sub_types)
    severity = SEVERITY_LEVELS[index % len(SEVERITY_LEVELS)]
    duration = rng.choice(DURATION_OPTIONS)
    state = rng.choice(NIGER_DELTA_STATES)

    submitted_at = fictional_datetime(
        rng, datetime(2026, 1, 1, tzinfo=timezone.utc), datetime(2026, 6, 30, tzinfo=timezone.utc)
    )
    incident_dt = submitted_at - timedelta(hours=rng.randint(0, 72))

    has_gps = rng.random() < 0.7
    location = {
        'gps': (
            {
                'lat': round(rng.uniform(*LAT_RANGE), 5),
                'lng': round(rng.uniform(*LNG_RANGE), 5),
                'accuracy': round(rng.uniform(5, 50), 1),
                'capturedAt': int(incident_dt.timestamp() * 1000),
            }
            if has_gps
            else None
        ),
        'display': f'Synthetic Location {index:03d}, {state}' if has_gps else None,
        'state': state,
        'lga': f'Synthetic LGA {index % 9}',
        'landmark': None if has_gps else f'Fictional Creek Landing {index:03d}, {state}',
    }

    photo_count = rng.choice([0, 0, 1, 1, 2, 3])
    colors = [(200, 40, 30), (30, 90, 200), (60, 150, 60)]
    photos = [make_png_data_url(8, 8, colors[i % len(colors)]) for i in range(photo_count)]

    health_impact = rng.random() < 0.4
    symptoms = rng.sample(SYMPTOM_OPTIONS, k=rng.randint(1, 3)) if health_impact else []
    affected_count = rng.choice(AFFECTED_COUNT_OPTIONS) if health_impact else None

    anonymous = rng.random() < 0.5
    contact = {
        'anonymous': anonymous,
        'name': None if anonymous else f'Synthetic Reporter {index:03d}',
        'phone': None if anonymous else f'+234800{index:07d}',
        'willingToContact': False if anonymous else rng.random() < 0.6,
        'willingToWitness': False if anonymous else rng.random() < 0.3,
        'wantsNotification': False if anonymous else rng.random() < 0.5,
    }

    report = {
        'id': str(uuid.UUID(int=rng.getrandbits(128))),
        'referenceNumber': f'HSSE-SYN-{index:04d}',
        'submittedAt': submitted_at.isoformat().replace('+00:00', 'Z'),
        'status': 'submitted',
        'dataClass': 'developer_test',
        'location': location,
        'incident': {
            'type': incident_type,
            'subType': sub_type,
            'severity': severity,
            'duration': duration,
            'dateTime': incident_dt.isoformat().replace('+00:00', 'Z'),
            'description': (
                f'Synthetic test description for {incident_type} scenario #{index:03d}. '
                'Fabricated for validation purposes only; not a real incident report.'
            ),
        },
        'evidence': {'photos': photos, 'photoCount': photo_count},
        'health': {'healthImpact': health_impact, 'symptoms': symptoms, 'affectedCount': affected_count},
        'contact': contact,
        'evidenceStatus': {'level': 'community_observed', 'externalReference': None, 'verification': None},
        'regulatory': {
            'nosdraNotified': False,
            'nosdraNotifiedAt': None,
            'nuprcNotified': False,
            'nuprcNotifiedAt': None,
            'operatorResponse': None,
            'jivScheduled': False,
            'jivDate': None,
            'jivCompleted': False,
            'cleanupStatus': 'pending',
        },
        'methane': {'calculated': False, 'estimatedCH4': None, 'estimatedCO2e': None},
        'audit': {
            'consentVersion': 'NDPA-2023-v1',
            'consentTimestamp': submitted_at.isoformat().replace('+00:00', 'Z'),
            'language': 'en' if index % 4 else 'pcm',
            'userAgent': 'synthetic-generator/validation',
            'appVersion': 'synthetic-test-data',
        },
    }

    sealed = seal_report(report, hashed_at=submitted_at.isoformat().replace('+00:00', 'Z'))

    # Every record exercises the append-only event log, mirroring what
    # src/utils/dashboardUtils.js's updateReportWithEvent does after
    # submission (NOSDRA notification, evidence-status upgrade, cleanup
    # status change) — so tamper_test.py's event-chain and truncation
    # scenarios have events to work with on the full corpus, not just a
    # handful of records.
    event_count = rng.randint(2, 4)
    event_kinds = [
        rng.choice(['nosdra_notified', 'cleanup_status_changed', 'evidence_status_changed'])
        for _ in range(event_count)
    ]
    evidence_status = dict(sealed['evidenceStatus'])
    for seq, kind in enumerate(event_kinds):
        event_type, data, timestamp = _synthetic_event_content(kind, index, seq, submitted_at)
        event_id = str(uuid.UUID(int=rng.getrandbits(128)))
        sealed = append_event(sealed, event_id, event_type, timestamp, data)
        if kind == 'evidence_status_changed':
            evidence_status = {
                'level': 'externally_referenced',
                'externalReference': data['externalReference'],
                'verification': None,
            }

    # Keep the denormalized regulatory fields consistent with what
    # replaying the event log actually produces — the same replay
    # verifyReport()/verify_report() now runs, so a freshly generated
    # synthetic record verifies as statusConsistent by construction.
    derived = derive_regulatory_status(sealed['events'])
    sealed['regulatory'] = {
        **sealed['regulatory'],
        'nosdraNotified': derived['nosdraNotified'],
        'nosdraNotifiedAt': derived['nosdraNotifiedAt'],
        'cleanupStatus': derived['cleanupStatus'],
    }
    sealed['evidenceStatus'] = evidence_status

    return sealed


def _synthetic_event_content(kind, index, seq, base_time):
    if kind == 'nosdra_notified':
        ts = (base_time + timedelta(hours=6 * (seq + 1))).isoformat().replace('+00:00', 'Z')
        return 'nosdra_notified', {'notifiedAt': ts}, ts
    if kind == 'cleanup_status_changed':
        status = CLEANUP_STATUSES[min(seq, len(CLEANUP_STATUSES) - 1)]
        ts = (base_time + timedelta(days=seq + 1)).isoformat().replace('+00:00', 'Z')
        return 'cleanup_status_changed', {'status': status}, ts
    if kind == 'evidence_status_changed':
        ts = (base_time + timedelta(days=2 * (seq + 1))).isoformat().replace('+00:00', 'Z')
        external_reference = {
            'type': 'oil_spill_monitor',
            'id': f'NOSDRA-OSM-SYN-{index:04d}-{seq}',
            'url': f'https://example.org/synthetic/{index:04d}/{seq}',
            'accessedAt': ts[:10],
        }
        return (
            'evidence_status_changed',
            {'level': 'externally_referenced', 'externalReference': external_reference},
            ts,
        )
    raise ValueError(f'Unknown synthetic event kind: {kind}')


def main():
    rng = random.Random(SEED)
    reports = [build_report(rng, i) for i in range(RECORD_COUNT)]

    incident_types_seen = {r['incident']['type'] for r in reports}
    severities_seen = {r['incident']['severity'] for r in reports}
    assert incident_types_seen == set(INCIDENT_TYPES.keys()), 'not every incident type was generated'
    assert severities_seen == set(SEVERITY_LEVELS), 'not every severity level was generated'

    out_dir = os.path.join(os.path.dirname(__file__), 'synthetic')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'synthetic_reports.json')
    with open(out_path, 'w') as f:
        json.dump(
            {
                'generatedBy': 'validation/make_synthetic.py',
                'seed': SEED,
                'note': 'Fabricated test data only. No real incidents, people, or locations.',
                'recordCount': len(reports),
                'reports': reports,
            },
            f,
            indent=2,
        )
    print(f'Wrote {len(reports)} synthetic reports to {out_path}')


if __name__ == '__main__':
    main()
