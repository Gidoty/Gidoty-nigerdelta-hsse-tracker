import { t } from '../data/translations.js'
import { fmt } from './formatters.js'
import { evidenceStatusLabel } from './evidenceStatus.js'

const HOUR_MS = 60 * 60 * 1000

export function hoursSince(isoString) {
  if (!isoString) return null
  return (Date.now() - new Date(isoString).getTime()) / HOUR_MS
}

export function formatElapsed(hours) {
  if (hours < 24) return `${Math.floor(hours)} hour${Math.floor(hours) === 1 ? '' : 's'}`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'}`
}

export function notificationTimerLevel(hours) {
  if (hours < 24) return 'ok'
  if (hours <= 72) return 'warning'
  return 'critical'
}

export function isAwaitingOperatorResponse(report) {
  if (!report.regulatory?.nosdraNotified) return false
  if (report.regulatory?.operatorResponse !== null) return false
  const hours = hoursSince(report.regulatory?.nosdraNotifiedAt)
  return hours !== null && hours > 24
}

export function computeEscalationStats(reports) {
  return {
    total: reports.length,
    nosdraNotified: reports.filter((r) => r.regulatory?.nosdraNotified).length,
    awaitingResponse: reports.filter(isAwaitingOperatorResponse).length,
    resolved: reports.filter((r) => r.regulatory?.cleanupStatus === 'completed').length,
  }
}

export function generateNosdraNotificationText(report, estimatedSpillOccurredAt) {
  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
  const severityLabel = t('en', 'severityLevels')[report.incident.severity]?.label ?? report.incident.severity
  const location = [report.location.state, report.location.lga].filter(Boolean).join(', ')
  const display = report.location.display
  const spillOccurredAt = estimatedSpillOccurredAt ?? report.regulatory?.estimatedSpillOccurredAt

  return `NOSDRA INCIDENT NOTIFICATION

Date: ${fmt.datetime(new Date().toISOString())}
Reference: ${report.referenceNumber}
Incident Type: ${typeLabel}
Location: ${location}, approximately ${display ? `${display.lat}°N, ${display.lng}°E` : 'location not captured'}
Severity: ${severityLabel}
${spillOccurredAt ? `Estimated Time of Occurrence: ${fmt.datetime(spillOccurredAt)} (reporter estimate, not confirmed)\n` : ''}
This notification is submitted pursuant to the NOSDRA Act 2006 and the Oil Spill Recovery, Clean-up, Remediation and Damage Assessment Regulations 2011.

Community Description:
${report.incident.description ?? ''}

This incident was reported via the NigerDelta HSSE Tracker (community environmental monitoring platform) at ${fmt.datetime(report.submittedAt)}.

Report Fingerprint (SHA-256, tamper-evident only — does not establish admissibility):
${report.integrity?.payloadHash ?? report.audit?.reportHash ?? 'not available'}

Evidence Status: ${evidenceStatusLabel(report)}

Requesting immediate response and Joint Investigation Visit scheduling as required under NOSDRA Act 2006.

Prepared by the reporter using NigerDelta HSSE Tracker. This is not an official NOSDRA document.`
}

export function generateFoiRequestText({ state, dateFrom, dateTo, referenceNumber, name, contact }) {
  return `FREEDOM OF INFORMATION REQUEST
Date: ${fmt.datetime(new Date().toISOString())}

To: The Director General
National Oil Spill Detection and Response Agency (NOSDRA)
7 Zambezi Crescent, Maitama, Abuja

Pursuant to the Freedom of Information Act 2011 (FoI Act), I hereby request the following information:

1. All oil spill records for ${state || '[State]'} from ${dateFrom || '[start date]'} to present, including: location, volume, cause classification, and JIV completion status.

2. The Joint Investigation Visit report for incident in ${state || '[State/LGA]'} on or around ${dateTo || '[date]'}, reference ${referenceNumber || '[reference number if applicable]'}.

3. Records of any operator notification and response for the above incident.

I note that under Section 4 of the FoI Act, public institutions shall respond within 7 days of receiving this request.

Submitted by: ${name || '[name field — optional]'}
Contact: ${contact || '[contact field — optional]'}

Prepared by the reporter using NigerDelta HSSE Tracker. This is not an official NOSDRA document.`
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

const ESCALATION_CSV_HEADERS = [
  'Reference',
  'Type',
  'Severity',
  'State',
  'LGA',
  'Reported',
  'NOSDRA Notified',
  'JIV Status',
  'Cleanup',
  'Elapsed Since Notification (hrs)',
]

export function exportEscalationCsv(reports) {
  const rows = reports
    .filter((report) => !report.incident?.isDemoData && (report.dataClass ?? 'operational') === 'operational')
    .map((report) => {
      const hours = hoursSince(report.regulatory?.nosdraNotifiedAt)
      return [
        report.referenceNumber,
        report.incident.type,
        report.incident.severity,
        report.location.state ?? '',
        report.location.lga ?? '',
        report.submittedAt,
        report.regulatory?.nosdraNotified ? 'yes' : 'no',
        report.regulatory?.jivCompleted ? 'completed' : report.regulatory?.jivScheduled ? 'scheduled' : 'not scheduled',
        report.regulatory?.cleanupStatus ?? 'pending',
        hours === null ? '' : hours.toFixed(1),
      ]
    })

  const csv = [ESCALATION_CSV_HEADERS, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `nigerdelta-hsse-escalation-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
