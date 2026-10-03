import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Droplet,
  Flame,
  MapPin,
  Users,
  Bell,
  Stethoscope,
  WifiOff,
  ShieldCheck,
  Clock,
  Languages,
  Code,
  Database,
  Satellite,
  CheckCircle2,
  XCircle,
  Smartphone,
  X,
} from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'

const STATS = [
  {
    icon: AlertTriangle,
    value: '13,885+',
    label: 'Spills recorded by NOSDRA since 2010',
    accent: 'text-danger',
    ring: 'ring-danger/30',
  },
  {
    icon: Droplet,
    value: '630,723 bbls',
    label: 'Estimated oil spilled since 2010',
    accent: 'text-amber',
    ring: 'ring-amber/30',
  },
  {
    icon: Flame,
    value: '229 Bcf',
    label: 'Gas flared in Nigeria in 2024',
    accent: 'text-warning',
    ring: 'ring-warning/30',
  },
]

const GAP_COLUMNS = [
  {
    title: 'NOSDRA Spill Monitor',
    icon: Database,
    highlight: false,
    items: [
      'Operator self-reported',
      '15–20% data discrepancy documented',
      'No community submission channel',
      'JIV evidence gap',
    ],
  },
  {
    title: 'Satellite Tools (SkyTruth, TROPOMI)',
    icon: Satellite,
    highlight: false,
    items: [
      'Detects but cannot receive ground reports',
      '9–13% margin of error on methane',
      'No community health data',
      'No regulatory escalation',
    ],
  },
  {
    title: 'NigerDelta HSSE Tracker',
    icon: ShieldCheck,
    highlight: true,
    items: [
      'Community-submitted, evidence-status tracked',
      'GPS + photo evidence chain',
      'Mass-balance methane estimation',
      'NOSDRA notification log',
      'Article 24 African Charter grounded',
      'NDPA 2023 compliant',
    ],
  },
]

const FEATURES = [
  {
    icon: MapPin,
    title: 'Geo-Tagged Incident Reports',
    accent: 'text-teal',
    bg: 'bg-teal/10',
    text: 'GPS capture + photo upload. Timestamped evidence chain aligned with NOSDRA JIV standards.',
  },
  {
    icon: Users,
    title: 'Evidence Status Tracking',
    accent: 'text-safe',
    bg: 'bg-safe/10',
    text: 'Every report starts as community-observed. Status can be raised only by linking a specific external public record or citing a stated independent verification source — never by another submission from the same device.',
  },
  {
    icon: Flame,
    title: 'Methane Emission Estimator',
    accent: 'text-amber',
    bg: 'bg-amber/10',
    text: 'Mass-balance calculation from a user-supplied flared gas volume, CH₄ density from the ideal gas law, and a cited combustion efficiency.',
  },
  {
    icon: Bell,
    title: 'Regulatory Escalation Tracker',
    accent: 'text-danger',
    bg: 'bg-danger/10',
    text: 'Auto-generates timestamped NOSDRA/NUPRC notification logs. Documents operator 24-hour response obligation.',
  },
  {
    icon: Stethoscope,
    title: 'Air Quality and Health Monitor',
    accent: 'text-warning',
    bg: 'bg-warning/10',
    text: 'WHO 2021 AQG reference levels. Community health symptom reporting near flare sites. Epidemiological surveillance layer.',
  },
  {
    icon: WifiOff,
    title: 'Device-Local, Offline-First PWA',
    accent: 'text-teal',
    bg: 'bg-teal/10',
    text: 'Works fully without internet — reports are saved on your device, not a server. Export or share a report yourself whenever you’re ready. Built for Niger Delta realities.',
  },
  {
    icon: ShieldCheck,
    title: 'NDPA 2023 Compliant',
    accent: 'text-safe',
    bg: 'bg-safe/10',
    text: 'Full anonymity option. Explicit consent before data collection. Compliant with Nigeria Data Protection Act 2023.',
  },
  {
    icon: Clock,
    title: 'Incident Response Timeline',
    accent: 'text-amber',
    bg: 'bg-amber/10',
    text: 'Tracks each report from submission to cleanup. Documents operator non-response against the 24-hour legal obligation.',
  },
  {
    icon: Languages,
    title: 'Nigerian Pidgin English',
    accent: 'text-teal',
    bg: 'bg-teal/10',
    text: 'Reporting form available in Standard English and Nigerian Pidgin. UN human rights accessibility standard for affected communities.',
  },
  {
    icon: Code,
    title: 'Open Data API',
    accent: 'text-teal',
    bg: 'bg-teal/10',
    text: 'Aggregated anonymised incident data accessible via public REST API. UNEP Global Environmental Data Strategy 2025 interoperability standard.',
  },
]

const NIGERIAN_LAW = [
  'Constitution s.20 — Environment',
  'Constitution s.33 — Right to Life',
  'Constitution s.39 — Expression',
  'NOSDRA Act 2006',
  'Oil Spill Regulations 2011 s.5',
  'PIA 2021',
  'FOI Act 2011',
  'Nigerian Evidence Act 2011',
  'NDPA 2023',
  'Climate Change Act 2021',
]

const INTERNATIONAL_LAW = [
  'African Charter Art. 24',
  'IPCC AR6 WGI',
  'Ruggie Principles 2011',
  'Paris Agreement Art. 6.4',
  'UN HRD Declaration 1998',
  'WHO 2021 AQG',
]

function StatCard({ icon: Icon, value, label, accent, ring }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20 ring-1 ${ring}`}
    >
      <Icon className={`h-7 w-7 ${accent}`} />
      <p className={`mt-4 text-3xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  )
}

function GapColumn({ title, icon: Icon, items, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? 'border-teal bg-card shadow-lg shadow-teal/10 ring-1 ring-teal/40'
          : 'border-border bg-card'
      }`}
    >
      <span
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${
          highlight ? 'bg-teal/15 text-teal' : 'bg-bg text-muted'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-base font-bold text-text">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted">
            {highlight ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text, accent, bg }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10 transition-transform hover:-translate-y-1 hover:border-teal/50">
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${bg} ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-normal text-muted">{text}</p>
    </div>
  )
}

function LegalPill({ label, variant }) {
  const styles =
    variant === 'teal'
      ? 'border-teal/40 bg-teal/10 text-teal'
      : 'border-border bg-panel text-text'
  return (
    <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium ${styles}`}>
      {label}
    </span>
  )
}

function InstallBanner() {
  const { installPrompt, promptInstall, dismiss } = useInstallPrompt()

  if (!installPrompt) return null

  return (
    <div className="border-t border-teal bg-bg px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
            <Smartphone className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-text">Install NigerDelta HSSE Tracker on your device</p>
            <p className="mt-0.5 text-xs text-muted">Works offline · No app store required · Free forever</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="flex min-h-[44px] items-center text-xs font-medium text-muted hover:text-text"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={promptInstall}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-teal px-5 text-sm font-bold text-white hover:bg-teal/90"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install banner"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:text-text sm:flex"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,168,204,0.18), rgba(10,22,40,0) 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(244,162,97,0.10), rgba(10,22,40,0) 70%)',
          }}
        />

        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-panel px-4 py-2 text-xs font-medium text-muted">
            Legally grounded · NOSDRA Act 2006 · African Charter Art. 24 · NDPA 2023
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
            Community Environmental Monitoring
            <br />
            for the Niger Delta
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-normal text-muted sm:text-lg">
            The first platform giving Niger Delta communities a structured, timestamped,
            legally-grounded channel to report oil spills, gas flares, and environmental health
            incidents — aligned with the NOSDRA Joint Investigation Visit evidentiary standard.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/report"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-teal px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal/20 transition-colors hover:bg-teal/90 sm:w-auto"
            >
              Report an Incident
            </Link>
            <Link
              to="/dashboard"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-teal px-6 py-3 text-sm font-bold text-text transition-colors hover:bg-teal/10 sm:w-auto"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs italic text-muted">
          Sources: NOSDRA Spill Monitor 2025 · World Bank Global Gas Flaring Tracker 2025
        </p>
      </section>

      {/* THE GAP */}
      <section className="border-t border-border bg-panel px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text">Why This Platform Exists</h2>
            <p className="mt-3 text-muted">Existing tools leave communities without a voice</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {GAP_COLUMNS.map((column) => (
              <GapColumn key={column.title} {...column} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text">Ten Integrated Features</h2>
            <p className="mt-3 text-muted">
              Built to global standard, designed for Niger Delta realities
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* LEGAL FOUNDATION */}
      <section className="border-t border-border bg-panel px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text">Legally Grounded at Every Level</h2>
            <p className="mt-3 text-muted">
              Pre-cleared across Nigerian constitutional, national, and international law
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {NIGERIAN_LAW.map((label) => (
              <LegalPill key={label} label={label} variant="navy" />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {INTERNATIONAL_LAW.map((label) => (
              <LegalPill key={label} label={label} variant="teal" />
            ))}
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-text">Built by Gideon Owhonda</h2>
          <p className="mt-1 text-sm text-teal">gideon.owhonda@cgrpng.org</p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-normal text-muted">
            This platform was built to bring engineering and environmental science to community
            accountability and environmental justice in the Niger Delta.
          </p>
        </div>
      </section>

      <InstallBanner />
    </>
  )
}
