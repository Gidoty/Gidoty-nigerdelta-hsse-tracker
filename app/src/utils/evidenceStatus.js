// Evidence-status enum, replacing the old same-device "corroboration count"
// mechanism. With no server, a second confirmation from the same browser
// cannot demonstrate independent agreement, so status can only advance by
// citing something outside the app: a public record, or a stated
// verification source. The UI never sets a level automatically.

export const EVIDENCE_STATUS = {
  COMMUNITY_OBSERVED: 'community_observed',
  EXTERNALLY_REFERENCED: 'externally_referenced',
  INDEPENDENTLY_VERIFIED: 'independently_verified',
}

export const EVIDENCE_STATUS_LABELS = {
  [EVIDENCE_STATUS.COMMUNITY_OBSERVED]: 'Community Observed',
  [EVIDENCE_STATUS.EXTERNALLY_REFERENCED]: 'Externally Referenced',
  [EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED]: 'Independently Verified',
}

export const EVIDENCE_STATUS_DESCRIPTIONS = {
  [EVIDENCE_STATUS.COMMUNITY_OBSERVED]: 'Reported by a community member only. No external record linked.',
  [EVIDENCE_STATUS.EXTERNALLY_REFERENCED]: 'Linked to a specific external public record.',
  [EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED]: 'Confirmed against a stated independent verification source.',
}

export const EXTERNAL_REFERENCE_TYPES = [
  { id: 'oil_spill_monitor', label: 'NOSDRA Oil Spill Monitor incident ID' },
  { id: 'gas_flare_tracker', label: 'NOSDRA/SDN Gas Flare Tracker site' },
  { id: 'other', label: 'Other public record' },
]

export function defaultEvidenceStatus() {
  return { level: EVIDENCE_STATUS.COMMUNITY_OBSERVED, externalReference: null, verification: null }
}

export function evidenceStatusLevel(report) {
  return report.evidenceStatus?.level ?? EVIDENCE_STATUS.COMMUNITY_OBSERVED
}

export function evidenceStatusLabel(report) {
  return EVIDENCE_STATUS_LABELS[evidenceStatusLevel(report)]
}
