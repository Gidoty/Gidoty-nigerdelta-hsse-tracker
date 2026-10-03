import { Link } from 'react-router-dom'
import { ShieldCheck, Scale, FlaskConical, Lock, User, AlertTriangle } from 'lucide-react'
import { CATEGORIES } from '../data/parameters.js'

const NIGERIAN_CONSTITUTIONAL = [
  'Constitution of the Federal Republic of Nigeria 1999, s.20',
  'Constitution of the Federal Republic of Nigeria 1999, s.33',
  'Constitution of the Federal Republic of Nigeria 1999, s.37',
  'Constitution of the Federal Republic of Nigeria 1999, s.39',
  'Constitution of the Federal Republic of Nigeria 1999, s.40',
]

const NIGERIAN_LEGISLATION = [
  'NOSDRA Act 2006',
  'Oil Spill Regulations 2011, Section 5',
  'Petroleum Industry Act (PIA) 2021',
  'Freedom of Information Act 2011',
  'Nigerian Evidence Act 2011',
  'Nigeria Data Protection Act (NDPA) 2023',
  'Climate Change Act 2021',
]

const INTERNATIONAL_INSTRUMENTS = [
  'African Charter on Human and Peoples’ Rights, Article 24',
  'UN Declaration on Human Rights Defenders 1998',
  'UN Guiding Principles on Business and Human Rights (Ruggie Principles) 2011',
  'Paris Agreement, Article 6.4',
  'IPCC 2006 Guidelines, Tier 1',
  'WHO 2021 Air Quality Guidelines',
]

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-3xl font-bold text-text">{title}</h2>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </div>
  )
}

function LawPill({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-text">
      {label}
    </span>
  )
}

export default function About() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-border px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            About NigerDelta HSSE Tracker
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-normal text-muted sm:text-lg">
            The first community-facing environmental monitoring platform designed for Niger Delta
            realities and grounded in Nigerian law.
          </p>
        </div>
      </section>

      {/* THE GAP */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="The Problem" title="The Gap This Tool Fills" />
        <div className="mx-auto mt-10 max-w-3xl space-y-5 text-sm leading-normal text-muted">
          <p>
            NOSDRA's own spill monitoring depends heavily on operator self-reporting, and
            independent analysis has repeatedly documented significant discrepancies between what
            operators report and what communities and field investigators observe on the ground.
            Where the record itself is contested, communities have historically had no formal
            channel to submit their own timestamped account.
          </p>
          <p>
            Satellite tools such as TROPOMI methane monitoring and SkyTruth flare tracking have
            improved detection at scale, but they are one-directional: they can observe a flare or
            a plume from orbit, yet they cannot receive a ground report, cannot capture a health
            symptom, and cannot document who a community holds accountable for a specific,
            located incident. IEA and World Bank flaring datasets confirm the scale of the
            problem — hundreds of billions of cubic feet of associated gas flared in Nigeria in
            recent years — without offering any mechanism for the people living beside those
            flares to be heard.
          </p>
          <p>
            Existing community-reporting tools, where they exist at all, are rarely built with an
            explicit legal framework underneath them. NigerDelta HSSE Tracker is designed
            differently from the ground up: every field in the report form, every generated
            document, and every retained record is mapped to a specific Nigerian or international
            legal instrument, so that a community submission is never just data — it is evidence,
            built to the standard NOSDRA's own Joint Investigation Visit process expects.
          </p>
        </div>
      </section>

      {/* WHAT THE PLATFORM DOES */}
      <section className="border-t border-border bg-panel px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="25 Features · 7 Categories"
          title="What the Platform Does"
          subtitle="Every feature in the app, organised exactly as it appears in the drawer"
        />
        <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${category.color}22`, color: category.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-text">
                    {category.label}
                  </h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {category.parameters.map((param) => (
                    <li key={param.id} className="text-sm text-muted">
                      {param.label}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* LEGAL FOUNDATION */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pre-Cleared Legal Audit"
          title="Legal Foundation"
          subtitle="Every legal instrument this platform is built against"
        />
        <div className="mx-auto mt-10 max-w-4xl space-y-8">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-text">
              <Scale className="h-4 w-4 text-teal" />
              Nigerian Constitutional
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {NIGERIAN_CONSTITUTIONAL.map((label) => (
                <LawPill key={label} label={label} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-text">
              <Scale className="h-4 w-4 text-teal" />
              Nigerian Legislation
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {NIGERIAN_LEGISLATION.map((label) => (
                <LawPill key={label} label={label} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-text">
              <Scale className="h-4 w-4 text-teal" />
              International Instruments
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {INTERNATIONAL_INSTRUMENTS.map((label) => (
                <LawPill key={label} label={label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCIENTIFIC METHODOLOGY */}
      <section className="border-t border-border bg-panel px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Methodology" title="Scientific Methodology" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
          {[
            {
              icon: FlaskConical,
              title: 'Methane Slip Calculation',
              text: 'Methane slip is estimated from a user-entered flared gas volume using a mass-balance calculation — volume × methane fraction × CH₄ density at the chosen reference conditions × the unburned fraction — rather than a fixed volumetric emission factor. Density is computed from the ideal gas law; combustion efficiency is selectable between a design assumption and a field-measured value, each separately cited in the calculator.',
            },
            {
              icon: FlaskConical,
              title: 'Global Warming Potential (GWP) Framework',
              text: 'Methane’s CO₂-equivalent climate impact is converted using IPCC AR6 (2021) fossil-methane global warming potentials — GWP₂₀ = 82.5 and GWP₁₀₀ = 29.8 — capturing both methane’s outsized short-term warming effect and the conventional 100-year basis used in national inventories.',
            },
            {
              icon: ShieldCheck,
              title: 'Evidence Integrity',
              text: 'Every submitted report is fingerprinted with a canonicalised SHA-256 hash at the moment of submission. This is a tamper-evident fingerprint: it detects later changes to the saved record. It does not establish that the report is true, who made it, or legal admissibility.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/15 text-teal">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-normal text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DATA PRIVACY */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="NDPA 2023 Compliance" title="Data Privacy" />
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            <div>
              <p className="text-sm font-bold text-text">What is collected</p>
              <p className="mt-1 text-sm text-muted">
                Incident type and description, your general location (never your exact address),
                photos you choose to upload, and health symptoms you choose to report.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-bold text-text">What is never collected without your choice</p>
              <p className="mt-1 text-sm text-muted">Your name, your phone number, your email address.</p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-safe" />
            <div>
              <p className="text-sm font-bold text-text">Anonymity guarantee</p>
              <p className="mt-1 text-sm text-muted">
                You may report completely anonymously. Anonymous mode strips all contact fields
                before a report is ever saved.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
            <div>
              <p className="text-sm font-bold text-text">Retention approach</p>
              <p className="mt-1 text-sm text-muted">
                Reports are stored locally on your device. The platform does not operate a central
                server database, so there is no remote copy of your report beyond what you
                yourself choose to submit through official channels.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <User className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            <div>
              <p className="text-sm font-bold text-text">Contact for data rights requests</p>
              <p className="mt-1 text-sm text-muted">
                gideon.owhonda@cgrpng.org, under the Nigeria Data Protection Act 2023.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section className="border-t border-border bg-panel px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-text">Built by Gideon Owhonda</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-normal text-muted">
            This platform applies engineering and environmental science to community
            accountability and environmental justice in the Niger Delta.
          </p>
          <p className="mt-4 text-sm text-teal">gideon.owhonda@cgrpng.org</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://gidoty.github.io"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-teal px-6 text-sm font-bold text-white hover:bg-teal/90 sm:w-auto"
            >
              View Portfolio
            </a>
            <a
              href="#"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-teal px-6 text-sm font-bold text-text hover:bg-teal/10 sm:w-auto"
            >
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-amber/40 bg-amber/5 p-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
          <p className="text-sm leading-normal text-text">
            The NigerDelta HSSE Tracker is a community monitoring tool. Data submitted through
            this platform constitutes community observations and does not replace formal
            regulatory investigation. All reports are labelled as community-submitted and
            unverified unless independently verified against a stated external source. The platform does not transmit data to
            NOSDRA or any regulatory body directly — community members are responsible for formal
            submissions through official channels.
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted">
          Ready to document an incident?{' '}
          <Link to="/report" className="font-bold text-teal hover:underline">
            Submit a report
          </Link>{' '}
          or{' '}
          <Link to="/dashboard" className="font-bold text-teal hover:underline">
            open the dashboard
          </Link>
          .
        </p>
      </section>
    </>
  )
}
