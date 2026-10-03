export const AFFECTED_COUNT_MIDPOINTS = {
  '1-5': 3,
  '6-20': 13,
  '21-100': 60,
  '100+': 150,
  unknown: 0,
}

export function affectedCountValue(report) {
  const key = report.health?.affectedCount
  return AFFECTED_COUNT_MIDPOINTS[key] ?? 0
}

export function isHealthImpactReport(report) {
  return report.health?.healthImpact === true
}
