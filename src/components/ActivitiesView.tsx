import { useState } from 'react'
import type { Activity } from '../types'
import ActivityModal from './ActivityModal'

interface Props {
  activities: Activity[]
  onAdd:    (a: Activity) => void
  onUpdate: (a: Activity) => void
  onDelete: (id: string)  => void
}

export default function ActivitiesView({ activities, onAdd, onUpdate, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState<Activity | undefined>()

  function openNew() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(activity: Activity) {
    setEditing(activity)
    setModalOpen(true)
  }

  function handleSave(activity: Activity) {
    if (editing) {
      onUpdate(activity)
    } else {
      onAdd(activity)
    }
    setEditing(undefined)
  }

  function handleClose() {
    setModalOpen(false)
    setEditing(undefined)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-purple-700">🎯 My Activities</h2>
        <button
          onClick={openNew}
          className="bg-purple-500 text-white font-bold px-5 py-2 rounded-full shadow-md hover:bg-purple-600 transition-colors flex items-center gap-2 text-lg"
        >
          <span>+</span> New Activity
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center text-gray-400 text-xl py-20">
          <div className="text-6xl mb-4">🌟</div>
          <p>No activities yet! Click <strong>+ New Activity</strong> to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {activities.map(activity => (
            <div key={activity.id} className="group relative">
              {/* Card */}
              <button
                type="button"
                onClick={() => openEdit(activity)}
                className={`${activity.color} w-full rounded-2xl p-4 shadow-md hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center gap-2 cursor-pointer`}
              >
                <span className="text-5xl">{activity.emoji}</span>
                <span className="text-white font-bold text-center text-sm">{activity.name}</span>
              </button>
              {/* Delete button */}
              <button
                type="button"
                onClick={() => onDelete(activity.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                title="Delete activity"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add new card */}
          <button
            type="button"
            onClick={openNew}
            className="rounded-2xl border-4 border-dashed border-purple-300 flex flex-col items-center justify-center gap-2 min-h-28 text-purple-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50 transition-all"
          >
            <span className="text-4xl leading-none">+</span>
            <span className="font-semibold text-sm">New Activity</span>
          </button>
        </div>
      )}

      {modalOpen && (
        <ActivityModal activity={editing} onSave={handleSave} onClose={handleClose} />
      )}
    </div>
  )
}
