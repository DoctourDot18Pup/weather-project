export const convertTemp = (celsius, unit) => {
  if (celsius == null) return null
  return unit === 'F' ? Math.round(celsius * 9 / 5 + 32) : Math.round(celsius)
}

export const unitLabel = (unit) => `°${unit}`
