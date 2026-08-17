import { TIME_INCREMENTS } from './types'
import type { Activity, ScheduledBlock, TimeIncrement } from './types'

export interface PlannerState {
  activities: Activity[]
  blocks: ScheduledBlock[]
  increment: TimeIncrement
}

const MAX_ACTIVITIES = 100
const MAX_BLOCKS = 64
const SCHEDULE_DURATION_MINUTES = 16 * 60

function isTimeIncrement(value: unknown): value is TimeIncrement {
  return TIME_INCREMENTS.some(increment => increment === value)
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null

  try {
    const base64NoPadding = value.replace(/-/g, '+').replace(/_/g, '/')
    const base64 = base64NoPadding.padEnd(Math.ceil(base64NoPadding.length / 4) * 4, '=')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

export function createShareLink(state: PlannerState) {
  const url = new URL(window.location.href)
  url.hash = new URLSearchParams({
    share: toBase64Url(JSON.stringify(state)),
  }).toString()
  return url.toString()
}

export function readSharedState(link: string): PlannerState | null {
  try {
    const url = new URL(link, window.location.href)
    const encoded = new URLSearchParams(url.hash.slice(1)).get('share')
    if (!encoded) return null

    const decoded = fromBase64Url(encoded)
    if (!decoded) return null

    const parsed: unknown = JSON.parse(decoded)
    if (!parsed || typeof parsed !== 'object') return null
    const { activities, blocks, increment } = parsed as Partial<PlannerState>
    if (!isTimeIncrement(increment) || !Array.isArray(activities) || !Array.isArray(blocks)) return null
    if (activities.length > MAX_ACTIVITIES || blocks.length > MAX_BLOCKS) return null

    const validActivities = activities.filter((activity): activity is Activity =>
      Boolean(
        activity
        && typeof activity.id === 'string'
        && typeof activity.name === 'string'
        && typeof activity.emoji === 'string'
        && typeof activity.color === 'string',
      ),
    )
    if (validActivities.length !== activities.length) return null

    const activityIds = new Set(validActivities.map(activity => activity.id))
    if (activityIds.size !== validActivities.length) return null

    const maxSlotIndex = SCHEDULE_DURATION_MINUTES / increment - 1
    const usedSlots = new Set<number>()
    const validBlocks = blocks.filter((block): block is ScheduledBlock => {
      const valid = Boolean(
        block
        && typeof block.instanceId === 'string'
        && activityIds.has(block.activityId)
        && Number.isInteger(block.slotIndex)
        && block.slotIndex >= 0
        && block.slotIndex <= maxSlotIndex
        && !usedSlots.has(block.slotIndex),
      )
      if (valid) usedSlots.add(block.slotIndex)
      return valid
    })
    if (validBlocks.length !== blocks.length) return null

    return { activities: validActivities, blocks: validBlocks, increment }
  } catch {
    return null
  }
}
