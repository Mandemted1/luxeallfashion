// Prices/revenue are stored in pesewas (minor unit), matching the database
// schema and the storefront's identical helper.
export function formatGhs(pesewas: number) {
  return `₵${Math.round(pesewas / 100).toLocaleString("en-GH")}`;
}
