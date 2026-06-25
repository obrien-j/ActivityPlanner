import type { View } from '../types'

interface Props {
  view: View
  setView: (v: View) => void
}

export default function Nav({ view, setView }: Props) {
  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center gap-4">
      <h1 className="text-2xl font-bold text-purple-600 mr-4">🗓️ Activity Planner</h1>
      <button
        onClick={() => setView('planner')}
        className={`px-4 py-2 rounded-full font-semibold transition-colors ${
          view === 'planner'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        📅 Day Planner
      </button>
      <button
        onClick={() => setView('activities')}
        className={`px-4 py-2 rounded-full font-semibold transition-colors ${
          view === 'activities'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        🎯 Activities
      </button>
    </nav>
  )
}
