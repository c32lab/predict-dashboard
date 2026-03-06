import { SWRConfig } from 'swr'
import PredictDashboard from './pages/PredictDashboard'

function App() {
  return (
    <SWRConfig value={{
      onError: (error, key) => { console.error(`[SWR Error] ${key}:`, error.message) },
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }}>
      <div className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="flex gap-4 px-6 py-3 bg-gray-900 border-b border-gray-800">
          <span className="text-blue-400 font-bold">Predict Dashboard</span>
        </nav>
        <PredictDashboard />
      </div>
    </SWRConfig>
  )
}
export default App
