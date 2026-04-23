// Bloque base reutilizable
export function Bone({ w = 'w-full', h = 'h-4', className = '' }) {
  return (
    <div className={`${w} ${h} bg-neutral-900 rounded animate-pulse ${className}`} />
  )
}

// Skeleton de la tarjeta principal
export function WeatherSkeleton() {
  return (
    <div className="space-y-5 py-2">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Bone w="w-44" h="h-8" />
          <Bone w="w-20" h="h-3" />
        </div>
        <Bone w="w-24" h="h-3" />
      </div>
      <div className="flex items-end justify-between mt-4">
        <Bone w="w-48" h="h-28" />
        <Bone w="w-16" h="h-16" />
      </div>
      <div className="space-y-1.5">
        <Bone w="w-36" h="h-3" />
        <Bone w="w-28" h="h-3" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-900">
        <Bone h="h-8" />
        <Bone h="h-8" />
        <Bone h="h-8" />
      </div>
    </div>
  )
}

// Skeleton de los detalles (ExtraStats)
export function StatsSkeleton() {
  return (
    <div className="space-y-1">
      <Bone w="w-16" h="h-2" className="mb-4" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-2 gap-x-6 py-4 border-b border-neutral-900">
          <div className="space-y-2">
            <Bone w="w-20" h="h-2" />
            <Bone w="w-28" h="h-4" />
          </div>
          <div className="space-y-2">
            <Bone w="w-20" h="h-2" />
            <Bone w="w-28" h="h-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton del pronóstico horario
export function HourlySkeleton() {
  return (
    <div className="space-y-1">
      <Bone w="w-32" h="h-2" className="mb-4" />
      <div className="flex gap-0 divide-x divide-neutral-900 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5 px-5 py-4 flex-shrink-0">
            <Bone w="w-8" h="h-2" />
            <Bone w="w-6" h="h-6" />
            <Bone w="w-8" h="h-4" />
            <Bone w="w-6" h="h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton del pronóstico diario
export function DailySkeleton() {
  return (
    <div className="space-y-1">
      <Bone w="w-24" h="h-2" className="mb-4" />
      <div className="divide-y divide-neutral-900">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5">
            <Bone w="w-10" h="h-3" />
            <Bone w="w-5" h="h-5" />
            <Bone h="h-px" className="flex-1" />
            <Bone w="w-20" h="h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
