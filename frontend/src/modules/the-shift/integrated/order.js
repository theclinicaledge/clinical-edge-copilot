// Catalog order follows the authored scenario number, never release/import order.
// Undesignated entries stay at the end, in their existing order.
export function orderShiftsByNumber(items) {
  const number = item => /^\d+$/.test(String(item.number).trim()) && Number(item.number) > 0 ? Number(item.number) : Infinity;
  return items.map((item, index) => ({ item, index })).sort((a, b) => number(a.item) - number(b.item) || a.index - b.index).map(({ item }) => item);
}
