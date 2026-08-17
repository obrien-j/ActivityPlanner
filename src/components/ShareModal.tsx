import { useState } from 'react'
import type { PlannerState } from '../share'
import { createShareLink, readSharedState } from '../share'

interface Props {
  state: PlannerState
  onImport: (state: PlannerState) => void
  onClose: () => void
}

export default function ShareModal({ state, onImport, onClose }: Props) {
  const shareLink = createShareLink(state)
  const [importLink, setImportLink] = useState('')
  const [message, setMessage] = useState('')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink)
      setMessage('Link copied!')
    } catch {
      setMessage('Copy the link from the box above.')
    }
  }

  function importState() {
    const imported = readSharedState(importLink)
    if (!imported) {
      setMessage('That link is not a valid Activity Planner share link.')
      return
    }
    onImport(imported)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-purple-600 mb-2">🔗 Share your planner</h2>
        <p className="text-sm text-gray-600 mb-4">
          Copy this link to open this exact planner on another computer. Nothing is saved online.
        </p>
        <input
          readOnly
          value={shareLink}
          onFocus={event => event.currentTarget.select()}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700"
          aria-label="Share link"
        />
        <button
          type="button"
          onClick={copyLink}
          className="mt-3 w-full py-2 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600"
        >
          Copy Share Link
        </button>

        <div className="border-t border-gray-200 mt-6 pt-5">
          <label className="text-sm font-semibold text-gray-600 block mb-1" htmlFor="import-link">
            Open a shared planner
          </label>
          <input
            id="import-link"
            type="url"
            value={importLink}
            onChange={event => setImportLink(event.target.value)}
            placeholder="Paste a share link"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={importState}
            disabled={!importLink}
            className="mt-3 w-full py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open Shared Planner
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-purple-600 text-center">{message}</p>}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}
