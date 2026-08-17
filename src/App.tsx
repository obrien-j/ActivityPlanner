import { useState, useCallback, useEffect } from 'react'
import type { Activity, ScheduledBlock, View, TimeIncrement } from './types'
import Nav from './components/Nav'
import ActivitiesView from './components/ActivitiesView'
import PlannerView from './components/PlannerView'
import ShareModal from './components/ShareModal'
import { readSharedState } from './share'
import type { PlannerState } from './share'

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'act-1', name: 'Reading',      emoji: '📚', color: 'bg-blue-400'   },
  { id: 'act-2', name: 'Drawing',      emoji: '🎨', color: 'bg-purple-400' },
  { id: 'act-3', name: 'Play Outside', emoji: '⛹️',  color: 'bg-green-400'  },
  { id: 'act-4', name: 'Snack Time',   emoji: '🍎', color: 'bg-orange-400' },
  { id: 'act-5', name: 'Nap Time',     emoji: '😴', color: 'bg-indigo-400' },
]

export default function App() {
  const [sharedState] = useState(() => readSharedState(window.location.href))
  const [view, setView]           = useState<View>('planner')
  const [activities, setActivities] = useState<Activity[]>(sharedState?.activities ?? INITIAL_ACTIVITIES)
  const [blocks, setBlocks]       = useState<ScheduledBlock[]>(sharedState?.blocks ?? [])
  const [increment, setIncrement] = useState<TimeIncrement>(sharedState?.increment ?? 30)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (sharedState) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [sharedState])

  const addActivity = useCallback((activity: Activity) => {
    setActivities(prev => [...prev, activity])
  }, [])

  const updateActivity = useCallback((updated: Activity) => {
    setActivities(prev => prev.map(a => (a.id === updated.id ? updated : a)))
  }, [])

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
    setBlocks(prev => prev.filter(b => b.activityId !== id))
  }, [])

  const addBlock = useCallback((activityId: string, slotIndex: number) => {
    setBlocks(prev => {
      const without = prev.filter(b => b.slotIndex !== slotIndex)
      return [
        ...without,
        { instanceId: `${activityId}-${slotIndex}-${Date.now()}`, activityId, slotIndex },
      ]
    })
  }, [])

  const moveBlock = useCallback((instanceId: string, newSlotIndex: number) => {
    setBlocks(prev => {
      const block = prev.find(b => b.instanceId === instanceId)
      if (!block) return prev
      const without = prev.filter(
        b => b.slotIndex !== newSlotIndex && b.instanceId !== instanceId,
      )
      return [
        ...without,
        { ...block, slotIndex: newSlotIndex, instanceId: `${block.activityId}-${newSlotIndex}-${Date.now()}` },
      ]
    })
  }, [])

  const removeBlock = useCallback((instanceId: string) => {
    setBlocks(prev => prev.filter(b => b.instanceId !== instanceId))
  }, [])

  const clearBlocks = useCallback(() => setBlocks([]), [])

  function importState(state: PlannerState) {
    setActivities(state.activities)
    setBlocks(state.blocks)
    setIncrement(state.increment)
    setView('planner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-purple-100">
      <Nav view={view} setView={setView} onShare={() => setShareOpen(true)} />
      {view === 'activities' ? (
        <ActivitiesView
          activities={activities}
          onAdd={addActivity}
          onUpdate={updateActivity}
          onDelete={deleteActivity}
        />
      ) : (
        <PlannerView
          activities={activities}
          blocks={blocks}
          increment={increment}
          setIncrement={setIncrement}
          onAddBlock={addBlock}
          onMoveBlock={moveBlock}
          onRemoveBlock={removeBlock}
          onClearBlocks={clearBlocks}
        />
      )}
      {shareOpen && (
        <ShareModal
          state={{ activities, blocks, increment }}
          onImport={importState}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
