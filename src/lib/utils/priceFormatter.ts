export function formatPrice(price: number): string {
  if (isNaN(price) || price < 0) return '0.00';

  return (price / 100).toFixed(2);
}
