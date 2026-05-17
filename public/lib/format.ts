export function formatMoney(cents: number, currencyCode = "SGD"): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function mmToCm(mm: number): number {
  return Math.round((mm / 10) * 10) / 10;
}
