import { createContext, useContext, useState } from 'react'

const UnitContext = createContext()

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState('C')
  const toggleUnit = () => setUnit((u) => (u === 'C' ? 'F' : 'C'))
  return (
    <UnitContext.Provider value={{ unit, toggleUnit }}>
      {children}
    </UnitContext.Provider>
  )
}

export const useUnit = () => useContext(UnitContext)
