// Explicit unit conversion for the EMAS assessment scripts. The source
// flare data is in BCM (billion cubic metres, the provider's own column
// header — see data/public/PROVENANCE.md); the app's methane calculator
// takes volumeM3 (cubic metres). 1 BCM = 1e9 m^3 by definition of the
// metric prefix "billion" (10^9), not a measured or provider-specific
// factor.
export const M3_PER_BCM = 1e9

export function bcmToM3(bcm) {
  if (typeof bcm !== 'number' || !Number.isFinite(bcm)) {
    throw new RangeError(`bcmToM3: expected a finite number, got ${bcm}`)
  }
  return bcm * M3_PER_BCM
}
