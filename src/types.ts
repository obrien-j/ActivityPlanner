export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface ScheduledBlock {
  instanceId: string;
  activityId: string;
  slotIndex: number;
}

export type View = 'activities' | 'planner';
export type TimeIncrement = 15 | 30;

export const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Red',    value: 'bg-red-400'    },
  { label: 'Orange', value: 'bg-orange-400' },
  { label: 'Yellow', value: 'bg-yellow-400' },
  { label: 'Green',  value: 'bg-green-400'  },
  { label: 'Teal',   value: 'bg-teal-400'   },
  { label: 'Blue',   value: 'bg-blue-400'   },
  { label: 'Indigo', value: 'bg-indigo-400' },
  { label: 'Purple', value: 'bg-purple-400' },
  { label: 'Pink',   value: 'bg-pink-400'   },
  { label: 'Rose',   value: 'bg-rose-400'   },
];
