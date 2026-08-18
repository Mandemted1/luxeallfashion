// Prices are stored in pesewas (minor unit), matching the database schema,
// so this formatter works unchanged once real catalog data replaces mocks.
export function formatGhs(pesewas: number) {
  return `₵${Math.round(pesewas / 100)}`;
}
