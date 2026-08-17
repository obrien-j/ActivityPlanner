import { useState, useCallback, useEffect } from 'react'
import type { Activity, ScheduledBlock, View, TimeIncrement } from './types'
import Nav from './components/Nav'
import ActivitiesView from './components/ActivitiesView'
import PlannerView from './components/PlannerView'

const STORAGE_KEY = 'activity-planner-state'

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'act-1', name: 'Reading',      emoji: '📚', color: 'bg-blue-400'   },
  { id: 'act-2', name: 'Drawing',      emoji: '🎨', color: 'bg-purple-400' },
  { id: 'act-3', name: 'Play Outside', emoji: '⛹️',  color: 'bg-green-400'  },
  { id: 'act-4', name: 'Snack Time',   emoji: '🍎', color: 'bg-orange-400' },
  { id: 'act-5', name: 'Nap Time',     emoji: '😴', color: 'bg-indigo-400' },
]

interface StoredState {
  view?: View
  activities?: Activity[]
  blocks?: ScheduledBlock[]
  increment?: TimeIncrement
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isActivity(value: unknown): value is Activity {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.emoji === 'string'
    && typeof value.color === 'string'
}

function isScheduledBlock(value: unknown): value is ScheduledBlock {
  return isRecord(value)
    && typeof value.instanceId === 'string'
    && typeof value.activityId === 'string'
    && typeof value.slotIndex === 'number'
}

function isView(value: unknown): value is View {
  return value === 'activities' || value === 'planner'
}

function isTimeIncrement(value: unknown): value is TimeIncrement {
  return value === 15 || value === 30
}

function loadStoredState(): StoredState {
  if (typeof window === 'undefined') return {}

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}

    const parsed: unknown = JSON.parse(stored)
    if (!isRecord(parsed)) return {}

    return {
      view:       isView(parsed.view) ? parsed.view : undefined,
      activities: Array.isArray(parsed.activities) && parsed.activities.every(isActivity)
        ? parsed.activities
        : undefined,
      blocks: Array.isArray(parsed.blocks) && parsed.blocks.every(isScheduledBlock)
        ? parsed.blocks
        : undefined,
      increment: isTimeIncrement(parsed.increment) ? parsed.increment : undefined,
    }
  } catch {
    return {}
  }
}

export default function App() {
  const [storedState]             = useState(loadStoredState)
  const [view, setView]           = useState<View>(storedState.view ?? 'planner')
  const [activities, setActivities] = useState<Activity[]>(storedState.activities ?? INITIAL_ACTIVITIES)
  const [blocks, setBlocks]       = useState<ScheduledBlock[]>(storedState.blocks ?? [])
  const [increment, setIncrement] = useState<TimeIncrement>(storedState.increment ?? 30)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ view, activities, blocks, increment }),
      )
    } catch {
      return
    }
  }, [view, activities, blocks, increment])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-purple-100">
      <Nav view={view} setView={setView} />
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
    </div>
  )
}
