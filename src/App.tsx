import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SWRConfig } from 'swr'

const PredictDashboard = lazy(() => import('./pages/PredictDashboard'))
const PredictionDetailPage = lazy(() => import('./pages/PredictionDetailPage'))
const AccuracyPage = lazy(() => import('./pages/AccuracyPage'))
const ChainPage = lazy(() => import('./pages/ChainPage'))

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
      Loading...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SWRConfig value={{
        onError: (error, key) => { console.error(`[SWR Error] ${key}:`, error.message) },
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}>
        <div className="bg-gray-950 text-gray-100 min-h-screen">
          <nav className="flex gap-4 px-6 py-3 bg-gray-900 border-b border-gray-800">
            <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/accuracy" className={navLinkClass}>Accuracy</NavLink>
            <NavLink to="/chain" className={navLinkClass}>Chain</NavLink>
          </nav>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<PredictDashboard />} />
              <Route path="/predictions/:id" element={<PredictionDetailPage />} />
              <Route path="/accuracy" element={<AccuracyPage />} />
              <Route path="/chain" element={<ChainPage />} />
            </Routes>
          </Suspense>
        </div>
      </SWRConfig>
    </BrowserRouter>
  )
}
export default App
