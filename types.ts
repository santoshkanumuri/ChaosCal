export interface CalendarEvent {
  id: string;
  title: string;
  date: Date; // Keep time info here
  type: 'work' | 'personal' | 'urgent';
  description?: string;
  sourceId?: string; // ID of the subscription this event came from
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarSubscription {
  id: string;
  name: string;
  url: string;
  color: string;
  lastSynced: Date | null;
  status: 'active' | 'loading' | 'error';
  useProxy: boolean; // Option to route through a CORS proxy
}