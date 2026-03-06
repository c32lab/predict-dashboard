import { createContext, useContext } from 'react'

const SymbolsContext = createContext<string[]>([])

const FALLBACK_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']

export function SymbolsProvider({ children }: { children: React.ReactNode }) {
  return (
    <SymbolsContext.Provider value={FALLBACK_SYMBOLS}>
      {children}
    </SymbolsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSymbols(): string[] {
  return useContext(SymbolsContext)
}
