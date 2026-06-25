import { useState, useEffect } from 'react'
import type { Activity } from '../types'
import { COLOR_OPTIONS } from '../types'

const EMOJI_OPTIONS = [
  '📚', '🎨', '⛹️', '🍎', '😴', '🎮', '🎵', '🏃', '🚴', '🌳',
  '🧩', '🍕', '🐶', '🎭', '🌟', '🏊', '🎒', '🍦', '🎡', '🦄',
  '🎯', '⚽', '🎸', '🧁', '🌈', '🚀', '🎪', '🐱', '🌻', '🏖️',
]

interface Props {
  activity?: Activity
  onSave: (activity: Activity) => void
  onClose: () => void
}

export default function ActivityModal({ activity, onSave, onClose }: Props) {
  const [name,  setName]  = useState(activity?.name  ?? '')
  const [emoji, setEmoji] = useState(activity?.emoji ?? '🎯')
  const [color, setColor] = useState(activity?.color ?? 'bg-blue-400')

  useEffect(() => {
    if (activity) {
      setName(activity.name)
      setEmoji(activity.emoji)
      setColor(activity.color)
    }
  }, [activity])

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id:    activity?.id ?? `act-${Date.now()}`,
      name:  name.trim(),
      emoji,
      color,
    })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter')  handleSave()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          {activity ? '✏️ Edit Activity' : '✨ New Activity'}
        </h2>

        {/* Name */}
        <label className="block mb-4">
          <span className="text-sm font-semibold text-gray-600 block mb-1">Activity Name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Reading Time"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg focus:border-purple-400 focus:outline-none"
            autoFocus
          />
        </label>

        {/* Emoji picker */}
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-600 block mb-2">Pick an Emoji</span>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-2xl p-1.5 rounded-xl transition-all ${
                  emoji === e
                    ? 'bg-purple-100 ring-2 ring-purple-400 scale-110'
                    : 'hover:bg-gray-100'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-5">
          <span className="text-sm font-semibold text-gray-600 block mb-2">Pick a Color</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                title={c.label}
                className={`w-8 h-8 rounded-full ${c.value} transition-all ${
                  color === c.value
                    ? 'ring-2 ring-offset-2 ring-purple-500 scale-110'
                    : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-5 flex justify-center">
          <div className={`${color} rounded-2xl px-6 py-3 flex items-center gap-2 shadow-md`}>
            <span className="text-3xl">{emoji}</span>
            <span className="text-white font-bold text-lg">{name || 'Preview'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activity ? 'Save Changes' : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  )
}
