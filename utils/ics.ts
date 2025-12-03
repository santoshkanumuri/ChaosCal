import { CalendarEvent } from '../types';

export const parseICS = (content: string, sourceId?: string): Partial<CalendarEvent>[] => {
  const lines = content.split(/\r\n|\n|\r/);
  const newEvents: Partial<CalendarEvent>[] = [];
  
  let currentEvent: Partial<CalendarEvent> | null = null;

  lines.forEach(line => {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { 
        id: Math.random().toString(36).substr(2, 9), 
        type: 'work',
        sourceId: sourceId
      };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.title && currentEvent.date) {
        newEvents.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('DTSTART:')) {
        // Basic parsing for ISO8601 compact format YYYYMMDDTHHMMSSZ
        const dateStr = line.substring(8);
        if (dateStr.length >= 8) {
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          let hours = 0;
          let minutes = 0;
          
          if (dateStr.includes('T')) {
            const timeStr = dateStr.split('T')[1];
            hours = parseInt(timeStr.substring(0, 2));
            minutes = parseInt(timeStr.substring(2, 4));
          }

          currentEvent.date = new Date(year, month, day, hours, minutes);
        }
      }
    }
  });

  return newEvents;
};

export const generateICS = (events: CalendarEvent[]) => {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ChaosCal//Brutalist Calendar//EN\n";
    
  events.forEach(event => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    icsContent += "BEGIN:VEVENT\n";
    icsContent += `UID:${event.id}@chaoscal.app\n`;
    icsContent += `DTSTAMP:${formatDate(new Date())}\n`;
    icsContent += `DTSTART:${formatDate(event.date)}\n`;
    icsContent += `SUMMARY:${event.title}\n`;
    if (event.description) {
      icsContent += `DESCRIPTION:${event.description}\n`;
    }
    icsContent += "END:VEVENT\n";
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
};