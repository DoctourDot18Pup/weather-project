const sizeMap = {
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-5 h-5 border-[1.5px]',
  lg: 'w-8 h-8 border-2',
}

function LoadingSpinner({ size = 'md' }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block rounded-full border-neutral-700 border-t-white animate-spin ${sizeMap[size]}`}
    />
  )
}

export default LoadingSpinner
