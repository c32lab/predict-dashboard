import PredictDashboard from './pages/PredictDashboard'

function App() {
  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen">
      <nav className="flex gap-4 px-6 py-3 bg-gray-900 border-b border-gray-800">
        <span className="text-blue-400 font-bold">Predict Dashboard</span>
      </nav>
      <PredictDashboard />
    </div>
  )
}
export default App
