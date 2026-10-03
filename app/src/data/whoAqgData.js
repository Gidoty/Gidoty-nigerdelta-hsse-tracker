// The six WHO 2021 Air Quality Guideline pollutants: PM2.5, PM10, O3, NO2,
// SO2, CO. Niger Delta context figures below are carried over from
// pre-existing app content and have not been independently re-verified
// against the cited papers during this audit — see
// docs/AUTHOR_ACTION_REQUIRED.md.
export const WHO_AQG_POLLUTANTS = [
  {
    id: 'pm25',
    name: 'PM2.5',
    fullName: 'Fine Particulate Matter',
    guideline: '15 µg/m³ (24-hr mean) · 5 µg/m³ (annual)',
    nigerDeltaContext:
      'Documented at levels exceeding the 24-hour guideline by over 400% in communities near gas flare sites.',
    source: 'Nwosisi et al. 2021, Scientific African',
    healthEffects: 'Respiratory and cardiovascular disease, exacerbated asthma, reduced lung development in children.',
  },
  {
    id: 'pm10',
    name: 'PM10',
    fullName: 'Coarse Particulate Matter',
    guideline: '45 µg/m³ (24-hr mean) · 15 µg/m³ (annual)',
    nigerDeltaContext:
      'Elevated particulate loading documented in flaring-adjacent communities compared to WHO limits, linked to soot fallout from incomplete combustion.',
    source: 'Zabbey et al. 2021',
    healthEffects: 'Airway irritation, reduced lung function, aggravated chronic bronchitis.',
  },
  {
    id: 'o3',
    name: 'O₃',
    fullName: 'Ozone',
    guideline: '60 µg/m³ (peak season) · 100 µg/m³ (8-hr mean)',
    nigerDeltaContext:
      'Ground-level ozone forms from flare-associated NOx and volatile organic compounds reacting in sunlight; site-specific Niger Delta ozone monitoring data was not identified for this app.',
    source: 'WHO 2021 AQG',
    healthEffects: 'Airway inflammation, reduced lung function, aggravated asthma.',
  },
  {
    id: 'so2',
    name: 'SO₂',
    fullName: 'Sulphur Dioxide',
    guideline: '40 µg/m³ (24-hr mean)',
    nigerDeltaContext:
      'Documented exceeding the 24-hour guideline by over 400% near active flare sites, driven by sulphur content in associated gas.',
    source: 'Nwosisi et al. 2021, Scientific African',
    healthEffects: 'Bronchoconstriction, eye and throat irritation, worsened asthma symptoms.',
  },
  {
    id: 'no2',
    name: 'NO₂',
    fullName: 'Nitrogen Dioxide',
    guideline: '25 µg/m³ (24-hr mean) · 10 µg/m³ (annual)',
    nigerDeltaContext:
      'Elevated ambient NO₂ associated with continuous gas flaring documented in flare-adjacent communities.',
    source: 'HumAngle Media / Obrikom study, 2024',
    healthEffects: 'Airway inflammation, increased susceptibility to respiratory infection.',
  },
  {
    id: 'co',
    name: 'CO',
    fullName: 'Carbon Monoxide',
    guideline: '4 mg/m³ (24-hr mean)',
    nigerDeltaContext:
      'Incomplete combustion from flares documented to elevate ambient CO near flare stacks and downwind settlements.',
    source: 'HumAngle Media / Obrikom study, 2024',
    healthEffects: 'Reduced oxygen delivery in blood, headaches, dizziness, fatigue.',
  },
]

// Not one of the six WHO 2021 AQG pollutants, and the cited figure is a
// drinking-water concentration, not an air concentration — kept as a
// separate note so it is never read as an air-quality guideline exceedance.
export const OTHER_PETROLEUM_SUBSTANCES = [
  {
    id: 'benzene',
    name: 'Benzene',
    fullName: 'Benzene (C₆H₆)',
    context:
      'UNEP’s Environmental Assessment of Ogoniland (2011) found benzene in drinking water at Nisisioken Ogale at approximately 900 times the WHO guideline for drinking water — this is a water concentration, not an air concentration.',
    source: 'UNEP, Environmental Assessment of Ogoniland (2011)',
    healthEffects: 'Leukaemia and other blood cancers with long-term exposure; acute exposure causes dizziness and headaches.',
  },
]

export const WHO_EXCEEDANCE_SUMMARY = {
  text: 'A 2025 review of Niger Delta air quality studies found ambient concentrations of key pollutants routinely exceeding WHO 2021 Air Quality Guideline limits in flaring-adjacent communities, with respiratory and dermatological complaints consistently the most reported symptoms among affected populations.',
  source: 'Wami-Amadi & Chisom Faith (2025)',
}
