export const TYPE_MARKER_COLORS = {
  oil_spill: '#E63946',
  gas_flare: '#F4A261',
  water_pollution: '#3A86FF',
  air_pollution: '#8B9EB7',
  pipeline_fire: '#D95F02',
  chemical_spill: '#9D4EDD',
  health_emergency: '#7F1D1D',
  other: '#F0F4F8',
}

export const SEVERITY_RADIUS = {
  minor: 8,
  moderate: 12,
  serious: 16,
  critical: 20,
}

export const SEVERITY_WEIGHT = {
  minor: 0.3,
  moderate: 0.5,
  serious: 0.8,
  critical: 1.0,
}

export const SEVERITY_BADGE_CLASSES = {
  minor: 'bg-safe text-white',
  moderate: 'bg-warning text-bg',
  serious: 'bg-amber text-bg',
  critical: 'bg-danger text-white',
}
