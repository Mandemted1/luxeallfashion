// Prices/revenue are stored in pesewas (minor unit), matching the database
// schema and the storefront's identical helper.
//
// Rounding to the nearest whole cedi here used to silently discard any
// sub-cedi amount — 50 pesewas (GHC0.50) rendered as "GHC1", a 100% error.
// Whole-cedi prices (the overwhelming majority of the real catalog) still
// render exactly as before, since minimumFractionDigits only kicks in once
// there's an actual fractional part to show.
export function formatGhs(pesewas: number) {
  const cedis = pesewas / 100;
  const hasFraction = pesewas % 100 !== 0;
  return `₵${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
