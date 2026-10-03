import {
  FilePlus,
  MapPin,
  ClipboardList,
  Monitor,
  Map,
  ListFilter,
  BarChart3,
  PieChart,
  Timer,
  Calculator,
  Flame,
  Globe2,
  Wind,
  GitBranch,
  Calendar,
  AlarmClock,
  Bell,
  ClipboardCheck,
  Recycle,
  FileText,
  ScrollText,
  FileBarChart,
  FileSpreadsheet,
  Activity,
  Stethoscope,
  Users,
  Database,
  Code,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'

export const CATEGORIES = [
  {
    id: 'REPORT',
    label: 'Report',
    icon: FilePlus,
    color: '#00A8CC',
    quickAction: 'New Report',
    parameters: [
      {
        id: 'submit-new-incident',
        label: 'Submit New Incident',
        icon: MapPin,
        status: 'built',
        panel: 'submit-new-incident',
      },
      {
        id: 'my-submitted-reports',
        label: 'My Submitted Reports',
        icon: ClipboardList,
        status: 'built',
        panel: 'my-submitted-reports',
      },
    ],
  },
  {
    id: 'MONITOR',
    label: 'Monitor',
    icon: Monitor,
    color: '#F4A261',
    quickAction: 'New Report',
    parameters: [
      {
        id: 'live-heatmap',
        label: 'Reporting Hotspot Map',
        icon: Map,
        status: 'built',
        panel: 'live-heatmap',
        description:
          'A Leaflet map of every community-submitted incident across the Niger Delta, with a severity-weighted reporting-density layer, colour-coded markers, and the regional boundary overlay. Density reflects where people reported, not measured pollution levels.',
        reference: 'GeoJSON coordinates, WGS84 · NDPA 2023 coarse-location display',
      },
      {
        id: 'incident-feed',
        label: 'Incident Feed',
        icon: ListFilter,
        status: 'built',
        panel: 'incident-feed',
        description:
          'A filterable, sortable feed of every incident in the database. Filter by type, severity, status, or date range, and open any report for full detail.',
        reference: 'Community submissions via NigerDelta HSSE Tracker',
      },
      {
        id: 'incident-type-chart',
        label: 'Incident Type Chart',
        icon: BarChart3,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'A full-screen bar chart grouping every incident by type — oil spill, gas flare, water pollution, and more — to surface which hazards dominate the record.',
        reference: 'Aggregated from community-submitted incident records',
      },
      {
        id: 'severity-distribution',
        label: 'Severity Distribution',
        icon: PieChart,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'A donut chart showing the proportion of incidents at each severity level, from minor to critical, across the current dataset.',
        reference: 'Severity classification per community incident report form',
      },
      {
        id: 'response-time-analytics',
        label: 'Response Time Analytics',
        icon: Timer,
        status: 'built',
        panel: 'response-time-analytics',
        description:
          'Average and per-incident time from submission to NOSDRA notification, benchmarked against the 24-hour legal response window.',
        reference: 'NOSDRA Act 2006 24-hour operator response obligation',
      },
    ],
  },
  {
    id: 'CALCULATE',
    label: 'Calculate',
    icon: Calculator,
    color: '#2DC653',
    quickAction: 'Clear & Recalculate',
    parameters: [
      {
        id: 'methane-emissions',
        label: 'Methane Emissions (CH₄)',
        icon: Flame,
        status: 'built',
        panel: 'methane-emissions',
        description:
          'Estimates methane slip from a gas flare using a mass-balance calculation from a user-supplied flared volume, calculated from a submitted report or standalone entry.',
        reference: 'IPCC 2006 Guidelines, Vol. 2, Ch. 4 · API Compendium (2009)',
      },
      {
        id: 'co2-equivalent',
        label: 'CO₂ Equivalent',
        icon: Globe2,
        status: 'built',
        panel: 'co2-equivalent',
        description:
          'Converts a given mass of methane into CO₂-equivalent impact over both 20-year and 100-year time horizons using current global warming potentials.',
        reference: 'GWP₂₀ = 82.5, GWP₁₀₀ = 29.8 · IPCC AR6 WGI (2021), Table 7.SM.7',
      },
      {
        id: 'co2-from-combustion',
        label: 'CO₂ from Combustion',
        icon: Wind,
        status: 'built',
        panel: 'co2-from-combustion',
        description:
          'A standalone calculator for the CO₂ released when a given volume of flared gas is combusted, independent of any specific report.',
        reference: 'CO₂ from methane combustion only; C2+ hydrocarbons excluded',
      },
    ],
  },
  {
    id: 'TRACK',
    label: 'Track',
    icon: GitBranch,
    color: '#FFB703',
    quickAction: 'Export Log',
    parameters: [
      {
        id: 'incident-response-timeline',
        label: 'Incident Response Timeline',
        icon: Calendar,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'The five-stage lifecycle of every incident — Submitted, NOSDRA Notified, JIV Scheduled, JIV Completed, Cleanup — shown as a visual pipeline.',
        reference: 'NOSDRA Act 2006 · Oil Spill Regulations 2011, Section 5',
      },
      {
        id: 'operator-response-timer',
        label: 'Operator Response Timer',
        icon: AlarmClock,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'Live, colour-coded elapsed-time counters for every notified incident, flagging the 24-hour and 72-hour legal thresholds as they pass.',
        reference: 'NOSDRA Act 2006 — 24-hour operator stop-and-contain obligation',
      },
      {
        id: 'nosdra-notification-log',
        label: 'NOSDRA Notification Log',
        icon: Bell,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'A running log of every NOSDRA notification generated by the platform, with timestamps, and a button to generate a new one.',
        reference: 'NOSDRA Act 2006 · Oil Spill Regulations 2011, Section 5',
      },
      {
        id: 'jiv-status-tracker',
        label: 'JIV Status Tracker',
        icon: ClipboardCheck,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'Every report cross-referenced against its Joint Investigation Visit stage — not yet scheduled, scheduled, or completed.',
        reference: 'NOSDRA Act 2006 Joint Investigation Visit (JIV) process',
      },
      {
        id: 'cleanup-status-board',
        label: 'Cleanup Status Board',
        icon: Recycle,
        status: 'built',
        panel: 'cleanup-status-board',
        description:
          'A kanban board of every incident by remediation status — Pending, In Progress, Completed, Disputed — move a card to update its status.',
        reference: 'Oil Spill Recovery, Clean-up, Remediation and Damage Assessment Regulations 2011',
      },
    ],
  },
  {
    id: 'GENERATE',
    label: 'Generate',
    icon: FileText,
    color: '#06B6D4',
    quickAction: 'Download',
    parameters: [
      {
        id: 'nosdra-notification-letter',
        label: 'NOSDRA Notification Letter',
        icon: FileText,
        status: 'built',
        panel: 'nosdra-notification-letter',
        description:
          'A pre-filled, legally-worded incident notification letter ready to copy or download and send to NOSDRA through official channels.',
        reference: 'NOSDRA Act 2006 · Oil Spill Regulations 2011, Section 5',
      },
      {
        id: 'foi-request-document',
        label: 'FOI Request Document',
        icon: ScrollText,
        status: 'built',
        panel: 'foi-request-document',
        description:
          'A ready-to-send Freedom of Information request for oil spill records, JIV reports, and operator response history.',
        reference: 'Freedom of Information Act 2011, Section 4',
      },
      {
        id: 'methane-emission-report',
        label: 'Methane Emission Report',
        icon: FileBarChart,
        status: 'built',
        panel: 'methane-emission-report',
        description:
          'A full printable PDF summary of a methane emission calculation, including every input, formula, and result for the record.',
        reference: 'Mass-balance methodology, IPCC AR6 WGI (GWP)',
      },
      {
        id: 'csv-data-export',
        label: 'CSV Data Export',
        icon: FileSpreadsheet,
        status: 'built',
        panel: 'csv-data-export',
        description:
          'A full export of the incident database in CSV format, stripped of full-precision GPS coordinates in line with data protection requirements.',
        reference: 'Nigeria Data Protection Act 2023 — coarse location only',
      },
    ],
  },
  {
    id: 'HEALTH',
    label: 'Health',
    icon: Activity,
    color: '#E63946',
    quickAction: 'Submit Health Report',
    parameters: [
      {
        id: 'community-symptom-monitor',
        label: 'Community Symptom Monitor',
        icon: Stethoscope,
        status: 'built',
        panel: 'community-symptom-monitor',
        description:
          'Aggregated health symptoms reported across all incidents, shown as a frequency chart and clustered by location.',
        reference: 'WHO 2021 Air Quality Guidelines',
      },
      {
        id: 'who-aqg-reference-panel',
        label: 'WHO AQG Reference Panel',
        icon: Wind,
        status: 'built',
        panel: 'who-aqg-reference-panel',
        description:
          'A static reference card of WHO 2021 Air Quality Guideline limits for PM2.5, PM10, O₃, SO₂, NO₂, and CO, with documented Niger Delta exceedances.',
        reference: 'WHO 2021 AQG · Nwosisi et al. 2021, Scientific African',
      },
      {
        id: 'affected-population-counter',
        label: 'Affected Population Counter',
        icon: Users,
        status: 'built',
        panel: 'affected-population-counter',
        description:
          'An aggregated estimate of people affected across all incidents, broken down by incident type and severity.',
        reference: 'Self-reported affected-population ranges from community submissions',
      },
    ],
  },
  {
    id: 'DATA',
    label: 'Data',
    icon: Database,
    color: '#9D4EDD',
    quickAction: 'Download CSV',
    parameters: [
      {
        id: 'open-data-api',
        label: 'Open Data API',
        icon: Code,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'Documentation for querying aggregated, anonymised incident data — endpoints, parameters, and a sample JSON response.',
        reference: 'UNEP Global Environmental Data Strategy 2024–2025',
      },
      {
        id: 'corroboration-status',
        label: 'Evidence Status Board',
        icon: CheckCircle2,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'Every report ranked by evidence status — community observed, externally referenced, or independently verified — highlighting which incidents still lack an external record or verification source.',
        reference: 'Evidence status is a label only, not a claim of corroboration or admissibility',
      },
      {
        id: 'evidence-audit-log',
        label: 'Evidence Audit Log',
        icon: ShieldCheck,
        status: 'placeholder',
        panel: 'placeholder',
        description:
          'A table of every report’s SHA-256 audit fingerprint and submission timestamp, forming the immutable evidentiary record.',
        reference: 'Tamper-evident fingerprint. Detects later changes to the saved record. Does not establish that the report is true, who made it, or legal admissibility.',
      },
    ],
  },
]

export const DEFAULT_CATEGORY = 'MONITOR'
export const DEFAULT_PARAMETER = 'live-heatmap'

export function findParameter(parameterId) {
  for (const category of CATEGORIES) {
    const parameter = category.parameters.find((p) => p.id === parameterId)
    if (parameter) return { category, parameter }
  }
  return null
}

export function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)
}

export const TOTAL_PARAMETER_COUNT = CATEGORIES.reduce((sum, c) => sum + c.parameters.length, 0)
