const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return currencyFormatter.format(0)
  const amount = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(amount)) return currencyFormatter.format(0)
  return currencyFormatter.format(amount)
}

export function formatNumber(value: number | string | null | undefined): string {
  const amount = typeof value === 'string' ? Number(value) : value
  if (!amount || Number.isNaN(amount)) return '0'
  return new Intl.NumberFormat('en-IN').format(amount)
}
