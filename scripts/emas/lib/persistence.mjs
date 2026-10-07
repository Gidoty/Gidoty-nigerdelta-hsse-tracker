// Builds a 2022/2023/2024 site chain from the provider's own id2022/id2023
// back-reference columns (see data/public/PROVENANCE.md and
// data/public/NIGERIA_SITE_MATCH.md for how these columns are defined).
// No distance- or name-based matching is used — only the IDs the
// provider itself supplies.

function toIntOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

export function buildSitePersistence(rows) {
  const rows2022 = rows.filter((r) => Number(r.year) === 2022)
  const rows2023 = rows.filter((r) => Number(r.year) === 2023)
  const rows2024 = rows.filter((r) => Number(r.year) === 2024)

  const chains = []
  const chainBy2022Id = new Map()
  const chainBy2023Id = new Map()

  for (const r of rows2022) {
    const id2022 = toIntOrNull(r.site_id)
    const chain = { id2022, id2023: null, id2024: null }
    chains.push(chain)
    chainBy2022Id.set(id2022, chain)
  }

  for (const r of rows2023) {
    const id2023 = toIntOrNull(r.site_id)
    const backref2022 = toIntOrNull(r.id2022)
    let chain = backref2022 !== null ? chainBy2022Id.get(backref2022) : undefined
    if (!chain) {
      chain = { id2022: null, id2023, id2024: null }
      chains.push(chain)
    } else {
      chain.id2023 = id2023
    }
    chainBy2023Id.set(id2023, chain)
  }

  for (const r of rows2024) {
    const id2024 = toIntOrNull(r.site_id)
    const backref2023 = toIntOrNull(r.id2023)
    let chain = backref2023 !== null ? chainBy2023Id.get(backref2023) : undefined
    if (!chain) {
      chain = { id2022: null, id2023: null, id2024 }
      chains.push(chain)
    } else {
      chain.id2024 = id2024
    }
  }

  return chains.map((c) => {
    const present2022 = c.id2022 !== null
    const present2023 = c.id2023 !== null
    const present2024 = c.id2024 !== null
    let status
    if (present2022 && present2023 && present2024) status = 'present_all_years'
    else if (present2022 && present2023 && !present2024) status = 'dropped_after_2023'
    else if (present2022 && !present2023 && !present2024) status = 'dropped_after_2022'
    else if (!present2022 && present2023 && present2024) status = 'new_2023_persisted'
    else if (!present2022 && present2023 && !present2024) status = 'only_2023'
    else if (!present2022 && !present2023 && present2024) status = 'new_2024'
    else status = 'unclassified' // present2022 && !present2023 && present2024 cannot happen: 2024 only links via id2023
    return { id2022: c.id2022, id2023: c.id2023, id2024: c.id2024, present2022, present2023, present2024, status }
  })
}
