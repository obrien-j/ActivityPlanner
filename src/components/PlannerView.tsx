import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Activity, ScheduledBlock, TimeIncrement } from '../types'
import TimeSlot from './TimeSlot'
import ActivityPoolItem from './ActivityPoolItem'

const START_HOUR = 6
const END_HOUR   = 22

function getSlotCount(increment: TimeIncrement) {
  return ((END_HOUR - START_HOUR) * 60) / increment
}

function getSlotLabel(index: number, increment: TimeIncrement) {
  const totalMinutes = START_HOUR * 60 + index * increment
  const hours        = Math.floor(totalMinutes / 60)
  const minutes      = totalMinutes % 60
  const h            = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  const ampm         = hours >= 12 ? 'PM' : 'AM'
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

function isHourStart(index: number, increment: TimeIncrement) {
  return (index * increment) % 60 === 0
}

interface PoolDropZoneProps {
  children:   React.ReactNode
  isAnyBlock: boolean
}

function PoolDropZone({ children, isAnyBlock }: PoolDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id:   'pool-drop',
    data: { type: 'pool-remove' },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto rounded-2xl transition-colors ${
        isAnyBlock && isOver ? 'bg-red-50 ring-2 ring-red-300' : ''
      }`}
    >
      {children}
      {isAnyBlock && isOver && (
        <div className="text-center text-red-400 text-xs font-semibold py-2 animate-pulse">
          🗑️ Drop to remove
        </div>
      )}
    </div>
  )
}

interface Props {
  activities:    Activity[]
  blocks:        ScheduledBlock[]
  increment:     TimeIncrement
  setIncrement:  (i: TimeIncrement) => void
  onAddBlock:    (activityId: string, slotIndex: number) => void
  onMoveBlock:   (instanceId: string, newSlotIndex: number) => void
  onRemoveBlock: (instanceId: string) => void
  onClearBlocks: () => void
}

export default function PlannerView({
  activities,
  blocks,
  increment,
  setIncrement,
  onAddBlock,
  onMoveBlock,
  onRemoveBlock,
  onClearBlocks,
}: Props) {
  const [activeId,       setActiveId]       = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<Record<string, unknown> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  const slotCount = getSlotCount(increment)

  const getBlock = useCallback(
    (slotIndex: number) => blocks.find(b => b.slotIndex === slotIndex),
    [blocks],
  )

  const getActivity = useCallback(
    (activityId: string) => activities.find(a => a.id === activityId),
    [activities],
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
    setActiveDragData((active.data.current as Record<string, unknown>) ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    setActiveDragData(null)

    if (!over) return

    const activeData = active.data.current as Record<string, unknown> | undefined
    const overData   = over.data.current   as Record<string, unknown> | undefined

    if (!activeData || !overData) return

    if (overData.type === 'slot') {
      const slotIndex = overData.slotIndex as number
      if (activeData.type === 'pool') {
        onAddBlock(activeData.activityId as string, slotIndex)
      } else if (activeData.type === 'block') {
        const fromSlot = activeData.slotIndex as number
        if (fromSlot !== slotIndex) {
          onMoveBlock(activeData.instanceId as string, slotIndex)
        }
      }
    } else if (overData.type === 'pool-remove' && activeData.type === 'block') {
      onRemoveBlock(activeData.instanceId as string)
    }
  }

  // Build overlay preview
  const overlayActivity =
    activeDragData?.type === 'pool'
      ? getActivity(activeDragData.activityId as string)
      : activeDragData?.type === 'block'
        ? getActivity(activeDragData.activityId as string)
        : null

  const draggingBlockExists = activeDragData?.type === 'block'

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex" style={{ height: 'calc(100vh - 60px)' }}>

        {/* ── Time Grid ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur border-b border-purple-100">
            <h2 className="text-xl font-bold text-purple-700">📅 Today's Schedule</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500 hidden sm:block">Blocks:</span>
              <div className="flex rounded-full overflow-hidden border-2 border-purple-300">
                {([15, 30] as TimeIncrement[]).map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setIncrement(val)}
                    className={`px-3 py-1 text-sm font-bold transition-colors ${
                      increment === val
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    {val} min
                  </button>
                ))}
              </div>
              {blocks.length > 0 && (
                <button
                  type="button"
                  onClick={onClearBlocks}
                  className="text-sm text-red-400 hover:text-red-600 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Slots */}
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white/80 rounded-2xl shadow-md mx-4 my-4 overflow-hidden">
              {Array.from({ length: slotCount }).map((_, i) => {
                const block    = getBlock(i)
                const activity = block ? getActivity(block.activityId) : undefined
                return (
                  <TimeSlot
                    key={i}
                    slotIndex={i}
                    label={getSlotLabel(i, increment)}
                    showHourLabel={isHourStart(i, increment)}
                    increment={increment}
                    block={block}
                    activity={activity}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Activity Pool ────────────────────────────────── */}
        <div className="w-52 bg-white/70 border-l border-purple-100 flex flex-col p-3 shrink-0">
          <h3 className="text-lg font-bold text-purple-600 mb-1 text-center">🎯 Activities</h3>
          <p className="text-xs text-gray-400 text-center mb-3">
            Drag onto schedule →<br />
            {blocks.length > 0 && 'Drag back here to remove'}
          </p>

          <PoolDropZone isAnyBlock={draggingBlockExists}>
            <div className="flex flex-col gap-2 p-1">
              {activities.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">
                  No activities yet.<br />Go to the Activities tab!
                </p>
              ) : (
                activities.map(activity => (
                  <ActivityPoolItem
                    key={activity.id}
                    activity={activity}
                    isActive={activeId === `pool-${activity.id}`}
                  />
                ))
              )}
            </div>
          </PoolDropZone>
        </div>
      </div>

      {/* Drag overlay for visual feedback while dragging */}
      <DragOverlay dropAnimation={null}>
        {overlayActivity && (
          <div
            className={`${overlayActivity.color} rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl cursor-grabbing select-none`}
          >
            <span className="text-xl">{overlayActivity.emoji}</span>
            <span className="text-white font-bold text-sm">{overlayActivity.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
