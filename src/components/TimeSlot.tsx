import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Activity, ScheduledBlock, TimeIncrement } from '../types'

interface PlacedBlockProps {
  block:    ScheduledBlock
  activity: Activity
}

function PlacedBlock({ block, activity }: PlacedBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id:   `block-${block.instanceId}`,
    data: {
      type:       'block',
      instanceId: block.instanceId,
      activityId: block.activityId,
      slotIndex:  block.slotIndex,
    },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg cursor-grab active:cursor-grabbing ${activity.color} text-white font-semibold text-sm select-none w-full transition-opacity ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <span className="shrink-0">{activity.emoji}</span>
      <span className="truncate">{activity.name}</span>
    </div>
  )
}

interface Props {
  slotIndex:      number
  label:          string
  showHourLabel:  boolean
  increment:      TimeIncrement
  block?:         ScheduledBlock
  activity?:      Activity
}

export default function TimeSlot({ slotIndex, label, showHourLabel, increment, block, activity }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id:   `slot-${slotIndex}`,
    data: { type: 'slot', slotIndex },
  })

  const slotHeightClass = increment === 15 ? 'h-10' : 'h-14'
  const borderClass     = showHourLabel
    ? 'border-t-2 border-gray-200'
    : 'border-t border-gray-100'

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center ${slotHeightClass} ${borderClass} transition-colors ${
        isOver ? 'bg-purple-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Time label */}
      <div
        className={`w-20 text-right pr-3 shrink-0 ${
          showHourLabel ? 'text-gray-700 font-semibold text-sm' : 'text-gray-300 text-xs'
        }`}
      >
        {showHourLabel ? label : ''}
      </div>

      {/* Drop zone content */}
      <div
        className={`flex-1 h-full flex items-center px-2 mx-1 rounded-lg ${
          isOver ? 'bg-purple-100 ring-1 ring-purple-300' : ''
        }`}
      >
        {block && activity ? (
          <PlacedBlock block={block} activity={activity} />
        ) : isOver ? (
          <span className="text-purple-400 text-sm font-semibold">Drop here!</span>
        ) : null}
      </div>
    </div>
  )
}
