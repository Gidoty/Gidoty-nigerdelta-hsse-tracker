export const fmt = {
  // Tonnes with 4 decimal places
  tonnes: (n) => `${n.toFixed(4)} tonnes`,

  // CO2e with 2 decimal places — always paired with its time horizon, per
  // IPCC guidance that a bare "CO2e" figure is meaningless without one.
  co2eHorizon: (n, years) => `${n.toFixed(2)} tonnes CO₂e (${years}-yr)`,

  // Large numbers with commas
  number: (n) => n.toLocaleString('en-NG'),

  // Volume in m³
  volume: (n) => `${n.toLocaleString('en-NG')} m³`,

  // Currency USD
  usd: (n) =>
    `USD ${n.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,

  // Currency NGN
  ngn: (n) => `₦${n.toLocaleString('en-NG')}`,

  // Percentage
  pct: (n) => `${(n * 100).toFixed(1)}%`,

  // Date and time (Nigerian format)
  datetime: (iso) => {
    const d = new Date(iso)
    return d.toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    })
  },

  // Time ago (relative)
  timeAgo: (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = diff / 3_600_000
    const days = hours / 24
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${Math.floor(hours)}h ago`
    if (days < 7) return `${Math.floor(days)}d ago`
    return fmt.datetime(iso)
  },

  // GPS display (2 decimal places)
  gps: (lat, lng) => `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,

  // Hash truncated for display
  hashShort: (hash) => (hash ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : 'Not generated'),
}
