import { storage } from './storage.js'
import { appendEvent } from './integrity.js'
import { evidenceStatusLabel } from './evidenceStatus.js'

export const INCIDENT_TYPE_LIST = [
  'oil_spill',
  'gas_flare',
  'water_pollution',
  'air_pollution',
  'pipeline_fire',
  'chemical_spill',
  'health_emergency',
  'other',
]

export const SEVERITY_LIST = ['critical', 'serious', 'moderate', 'minor']
const SEVERITY_RANK = { critical: 4, serious: 3, moderate: 2, minor: 1 }

export const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'nosdra_notified', label: 'NOSDRA Notified' },
  { id: 'resolved', label: 'Resolved' },
]

export function loadRealReports() {
  return storage.getReports()
}

export function updateReportInStorage(id, updater) {
  const reports = storage.getReports()
  const index = reports.findIndex((r) => r.id === id)
  if (index === -1) return reports
  return storage.saveReport(updater(reports[index]))
}

// Like updateReportInStorage, but first appends a hash-chained event
// recording the mutation (NOSDRA notification, cleanup status change,
// corroboration, etc.) before applying the denormalized field update the
// updater function describes. The events array is the audit trail; the
// fields it also updates are a materialized "current state" view kept for
// fast reads and filtering — both are updated together so they never drift.
export async function updateReportWithEvent(id, eventType, eventData, updater) {
  const reports = storage.getReports()
  const index = reports.findIndex((r) => r.id === id)
  if (index === -1) return reports
  const withEvent = await appendEvent(reports[index], eventType, eventData)
  return storage.saveReport(updater(withEvent))
}

export function deriveStatus(report) {
  if (report.regulatory?.cleanupStatus === 'completed') return 'resolved'
  if (report.regulatory?.nosdraNotified) return 'nosdra_notified'
  return 'submitted'
}

export function formatTimeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

export function defaultFilters() {
  return {
    search: '',
    types: new Set(INCIDENT_TYPE_LIST),
    severities: new Set(SEVERITY_LIST),
    status: 'all',
    dateFrom: '',
    dateTo: '',
  }
}

export function filterReports(reports, filters) {
  const query = filters.search.trim().toLowerCase()
  const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`).getTime() : null
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`).getTime() : null

  return reports.filter((report) => {
    if (!filters.types.has(report.incident.type)) return false
    if (!filters.severities.has(report.incident.severity)) return false
    if (filters.status !== 'all' && deriveStatus(report) !== filters.status) return false

    const submittedAt = new Date(report.submittedAt).getTime()
    if (from !== null && submittedAt < from) return false
    if (to !== null && submittedAt > to) return false

    if (query) {
      const haystack = [
        report.location.state,
        report.location.lga,
        report.location.landmark,
        report.incident.type,
        report.incident.subType,
        report.incident.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

export function sortReports(reports, sortBy) {
  const copy = [...reports]
  if (sortBy === 'severity') {
    return copy.sort(
      (a, b) =>
        SEVERITY_RANK[b.incident.severity] - SEVERITY_RANK[a.incident.severity] ||
        new Date(b.submittedAt) - new Date(a.submittedAt),
    )
  }
  return copy.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

const CSV_HEADERS = [
  'Reference Number',
  'Date/Time',
  'Incident Type',
  'Sub-Type',
  'Severity',
  'State',
  'LGA',
  'Display Lat (2dp)',
  'Display Lng (2dp)',
  'Description (first 200 chars)',
  'Health Impact',
  'Evidence Status',
  'Status',
  'NOSDRA Notified',
]

export function exportReportsToCsv(reports) {
  const rows = reports
    .filter((report) => !report.incident?.isDemoData && (report.dataClass ?? 'operational') === 'operational')
    .map((report) => [
      report.referenceNumber,
      report.incident.dateTime,
      report.incident.type,
      report.incident.subType ?? '',
      report.incident.severity,
      report.location.state ?? '',
      report.location.lga ?? '',
      report.location.display?.lat ?? '',
      report.location.display?.lng ?? '',
      (report.incident.description ?? '').slice(0, 200),
      report.health?.healthImpact ? 'yes' : 'no',
      evidenceStatusLabel(report),
      deriveStatus(report),
      report.regulatory?.nosdraNotified ? 'yes' : 'no',
    ])

  const csv = [CSV_HEADERS, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `nigerdelta-hsse-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
