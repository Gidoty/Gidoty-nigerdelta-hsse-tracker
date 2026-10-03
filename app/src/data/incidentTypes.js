import {
  Droplet,
  Flame,
  Waves,
  Wind,
  FlaskConical,
  HeartPulse,
  CircleHelp,
} from 'lucide-react'

export const INCIDENT_TYPES = [
  {
    id: 'oil_spill',
    icon: Droplet,
    subTypes: ['pipeline_leak', 'wellhead_blowout', 'tank_overflow', 'bunkering_theft', 'unknown_source'],
  },
  {
    id: 'gas_flare',
    icon: Flame,
    subTypes: ['routine_flare', 'emergency_flare', 'flare_near_community', 'unknown_flare'],
  },
  {
    id: 'water_pollution',
    icon: Waves,
    subTypes: ['creek_river', 'groundwater_well', 'coastal_estuary'],
  },
  {
    id: 'air_pollution',
    icon: Wind,
    subTypes: ['flare_smoke', 'chemical_smell', 'black_soot', 'acid_rain'],
  },
  {
    id: 'pipeline_fire',
    icon: Flame,
    subTypes: ['active_fire', 'recently_extinguished'],
  },
  {
    id: 'chemical_spill',
    icon: FlaskConical,
    subTypes: ['unknown_substance', 'known_chemical'],
  },
  {
    id: 'health_emergency',
    icon: HeartPulse,
    subTypes: ['mass_illness', 'skin_conditions', 'respiratory', 'contaminated_water'],
  },
  {
    id: 'other',
    icon: CircleHelp,
    subTypes: [],
  },
]

export const NIGER_DELTA_STATES = [
  'Bayelsa',
  'Rivers',
  'Delta',
  'Akwa Ibom',
  'Cross River',
  'Edo',
  'Ondo',
  'Imo',
  'Abia',
]

export const SEVERITY_LEVELS = [
  { id: 'minor', color: 'safe' },
  { id: 'moderate', color: 'warning' },
  { id: 'serious', color: 'amber' },
  { id: 'critical', color: 'danger' },
]

export const DURATION_OPTIONS = ['just_happened', 'today', 'days', 'ongoing', 'unknown']

export const AFFECTED_COUNT_OPTIONS = ['1-5', '6-20', '21-100', '100+', 'unknown']

export const SYMPTOM_OPTIONS = [
  'breathing',
  'skin',
  'eyes',
  'headache',
  'nausea',
  'smell',
  'vulnerable',
  'animals',
  'crops',
]
