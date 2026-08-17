import { useState, useCallback, useEffect } from 'react'
import { TIME_INCREMENTS } from './types'
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

interface AppState {
  view: View
  activities: Activity[]
  blocks: ScheduledBlock[]
  increment: TimeIncrement
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
  return typeof value === 'number' && TIME_INCREMENTS.includes(value as TimeIncrement)
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

function getInitialState(): AppState {
  const storedState = loadStoredState()
  return {
    view:       storedState.view ?? 'planner',
    activities: storedState.activities ?? INITIAL_ACTIVITIES,
    blocks:     storedState.blocks ?? [],
    increment:  storedState.increment ?? 30,
  }
}

export default function App() {
  const [{ view, activities, blocks, increment }, setAppState] = useState<AppState>(getInitialState)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ view, activities, blocks, increment }),
      )
    } catch {
    }
  }, [view, activities, blocks, increment])

  const setView = useCallback((view: View) => {
    setAppState(prev => ({ ...prev, view }))
  }, [])

  const setIncrement = useCallback((increment: TimeIncrement) => {
    setAppState(prev => ({ ...prev, increment }))
  }, [])

  const addActivity = useCallback((activity: Activity) => {
    setAppState(prev => ({ ...prev, activities: [...prev.activities, activity] }))
  }, [])

  const updateActivity = useCallback((updated: Activity) => {
    setAppState(prev => ({
      ...prev,
      activities: prev.activities.map(a => (a.id === updated.id ? updated : a)),
    }))
  }, [])

  const deleteActivity = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id),
      blocks:     prev.blocks.filter(b => b.activityId !== id),
    }))
  }, [])

  const addBlock = useCallback((activityId: string, slotIndex: number) => {
    setAppState(prev => {
      const without = prev.blocks.filter(b => b.slotIndex !== slotIndex)
      return {
        ...prev,
        blocks: [
          ...without,
          { instanceId: `${activityId}-${slotIndex}-${Date.now()}`, activityId, slotIndex },
        ],
      }
    })
  }, [])

  const moveBlock = useCallback((instanceId: string, newSlotIndex: number) => {
    setAppState(prev => {
      const block = prev.blocks.find(b => b.instanceId === instanceId)
      if (!block) return prev
      const without = prev.blocks.filter(
        b => b.slotIndex !== newSlotIndex && b.instanceId !== instanceId,
      )
      return {
        ...prev,
        blocks: [
          ...without,
          { ...block, slotIndex: newSlotIndex, instanceId: `${block.activityId}-${newSlotIndex}-${Date.now()}` },
        ],
      }
    })
  }, [])

  const removeBlock = useCallback((instanceId: string) => {
    setAppState(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.instanceId !== instanceId),
    }))
  }, [])

  const clearBlocks = useCallback(() => {
    setAppState(prev => ({ ...prev, blocks: [] }))
  }, [])

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
