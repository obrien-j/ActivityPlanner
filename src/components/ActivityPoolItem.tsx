import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Activity } from '../types'

interface Props {
  activity:  Activity
  isActive:  boolean
}

export default function ActivityPoolItem({ activity, isActive }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id:   `pool-${activity.id}`,
    data: { type: 'pool', activityId: activity.id },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${activity.color} rounded-xl px-3 py-2 flex items-center gap-2 cursor-grab active:cursor-grabbing shadow-md select-none transition-all ${
        isActive ? 'opacity-30' : 'hover:scale-105 hover:shadow-lg'
      }`}
    >
      <span className="text-xl shrink-0">{activity.emoji}</span>
      <span className="text-white font-bold text-sm truncate">{activity.name}</span>
    </div>
  )
}
