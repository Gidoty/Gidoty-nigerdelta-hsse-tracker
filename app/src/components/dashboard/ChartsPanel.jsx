import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { t } from '../../data/translations.js'
import { INCIDENT_TYPE_LIST, SEVERITY_LIST } from '../../utils/dashboardUtils.js'
import { TYPE_MARKER_COLORS } from '../../data/markerColors.js'

const SEVERITY_COLORS = {
  critical: '#E63946',
  serious: '#F4A261',
  moderate: '#FFB703',
  minor: '#2DC653',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#162840',
  border: '1px solid #1E3A5F',
  borderRadius: 8,
  color: '#F0F4F8',
  fontSize: 12,
}

export default function ChartsPanel({ reports }) {
  const typeData = INCIDENT_TYPE_LIST.map((type) => ({
    type: t('en', 'incidentTypes')[type],
    count: reports.filter((r) => r.incident.type === type).length,
    color: TYPE_MARKER_COLORS[type],
  }))

  const severityData = SEVERITY_LIST.map((severity) => ({
    name: t('en', 'severityLevels')[severity].label,
    value: reports.filter((r) => r.incident.severity === severity).length,
    color: SEVERITY_COLORS[severity],
  })).filter((entry) => entry.value > 0)

  return (
    <div className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-bold text-text">Reports by Incident Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={typeData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis
                dataKey="type"
                tick={{ fill: '#8B9EB7', fontSize: 10 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fill: '#8B9EB7', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,168,204,0.08)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {typeData.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-bold text-text">Severity Distribution</h3>
          {severityData.length === 0 ? (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted">
              No data to display.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                  labelLine={false}
                >
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#8B9EB7' }}
                  formatter={(value) => <span style={{ color: '#F0F4F8' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-6xl text-xs leading-normal text-muted">
        All data sourced from community submissions. Each report carries an evidence status —
        community observed, externally referenced, or independently verified — shown on the
        report itself. This data does not constitute legal proof without formal JIV verification
        under NOSDRA Act 2006.
      </p>
    </div>
  )
}
