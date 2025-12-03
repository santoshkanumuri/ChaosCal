import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addHours,
  set
} from 'date-fns';
import { CalendarHeader } from './components/CalendarHeader';
import { EventList } from './components/EventList';
import { EventModal } from './components/EventModal';
import { SyncModal } from './components/SyncModal';
import { CalendarEvent, CalendarSubscription } from './types';
import { BrutalistButton } from './components/BrutalistButton';
import { Zap } from 'lucide-react';
import { parseICS, generateICS } from './utils/ics';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Initial dummy data
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'MEETING_ALPHA',
      date: set(new Date(), { hours: 10, minutes: 0 }),
      type: 'work',
      description: 'Review Q3 destruction metrics.'
    },
    {
      id: '2',
      title: 'DENTIST',
      date: addHours(new Date(), 26),
      type: 'personal',
    },
    {
      id: '3',
      title: 'DEPLOY_PROD',
      date: set(new Date(), { date: 15, hours: 14, minutes: 30 }),
      type: 'urgent',
      description: 'Do not break the internet.'
    }
  ]);

  // Subscription State
  const [subscriptions, setSubscriptions] = useState<CalendarSubscription[]>([]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const selectedDateEvents = useMemo(() => {
    return events.filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, selectedDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleJumpToMonth = (date: Date) => setCurrentDate(date);
  
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      // Update existing
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } as CalendarEvent : e));
    } else {
      // Create new
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
      } as CalendarEvent;
      setEvents([...events, newEvent]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // --- Sync / ICS Logic ---

  const downloadICS = () => {
    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'chaos_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportICS = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newEvents = parseICS(content);
      
      if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents as CalendarEvent[]]);
        setIsSyncModalOpen(false);
        // Custom Brutalist alert? For now standard is fine.
        alert(`Ingested ${newEvents.length} protocols into the chaos.`);
      }
    };
    reader.readAsText(file);
  };

  // --- Subscription / Auto-Sync Logic ---

  const fetchSubscription = async (sub: CalendarSubscription) => {
    // Mark as loading
    setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'loading' } : s));

    try {
      let fetchUrl = sub.url;
      // CORS Proxy Logic: Google/Outlook blocks direct browser requests. 
      // Using a public proxy service is a common workaround for client-only apps.
      if (sub.useProxy) {
        fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(sub.url)}`;
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const text = await response.text();
      
      const newEvents = parseICS(text, sub.id); // Pass sourceId to parser

      // Remove old events from this source and add new ones
      setEvents(prev => {
        const keptEvents = prev.filter(e => e.sourceId !== sub.id);
        return [...keptEvents, ...newEvents as CalendarEvent[]];
      });

      // Update subscription status
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { 
        ...s, 
        status: 'active', 
        lastSynced: new Date() 
      } : s));

    } catch (error) {
      console.error("Sync failed for", sub.name, error);
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'error' } : s));
    }
  };

  const handleAddSubscription = (url: string, name: string, useProxy: boolean) => {
    const newSub: CalendarSubscription = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      url,
      useProxy,
      color: '#DFFF00',
      lastSynced: null,
      status: 'loading'
    };
    
    setSubscriptions(prev => [...prev, newSub]);
    fetchSubscription(newSub); // Initial fetch
  };

  const handleRemoveSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    setEvents(prev => prev.filter(e => e.sourceId !== id)); // Cleanup events from that source
  };

  const handleSyncAll = () => {
    subscriptions.forEach(sub => fetchSubscription(sub));
  };

  // Auto-sync effect (runs every 60 minutes)
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleSyncAll();
    }, 60 * 60 * 1000); 
    return () => clearInterval(intervalId);
  }, [subscriptions]);

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-black w-full md:max-w-3xl mx-auto relative shadow-2xl md:border-x-4 border-black font-family: 'Chivo Mono'">
      
      <CalendarHeader 
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToMonth={handleJumpToMonth}
        onToday={handleToday}
        onSync={() => setIsSyncModalOpen(true)}
      />

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1 px-2 mb-2">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center font-mono font-bold text-sm ${i % 2 === 0 ? '-rotate-2' : 'rotate-2'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 px-2 pb-8">
        {calendarDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayEvents = events.filter(e => isSameDay(e.date, day));
          const hasUrgent = dayEvents.some(e => e.type === 'urgent');

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`
                relative min-h-[60px] md:min-h-[100px] flex flex-col justify-between p-1 cursor-pointer transition-all duration-100
                border-2 border-black
                ${!isCurrentMonth ? 'opacity-30 border-dashed bg-gray-100 text-black' : 'bg-white text-black'}
                ${isSelected ? 'shadow-[4px_4px_0px_0px_black] -translate-y-1 -translate-x-1 bg-[#DFFF00] z-10' : 'hover:shadow-[2px_2px_0px_0px_black] hover:-translate-y-[1px]'}
                ${isToday && !isSelected ? 'bg-black text-white' : ''}
              `}
            >
              <span className={`
                text-sm font-bold font-mono 
                ${isToday && !isSelected ? 'text-[#DFFF00]' : ''}
              `}>
                {format(day, 'd')}
              </span>

              {/* Event Indicators */}
              <div className="flex flex-wrap gap-0.5 content-end">
                {dayEvents.map((ev, i) => (
                    i < 8 && (
                    <div 
                        key={i} 
                        className={`
                            w-2 h-2 border border-black
                            ${ev.type === 'urgent' ? 'bg-red-500' : ev.type === 'work' ? 'bg-blue-400' : 'bg-white'}
                            ${isSelected ? 'border-white' : ''}
                        `}
                    />
                    )
                ))}
              </div>

              {/* Decorative "Today" Marker if not selected */}
              {isToday && !isSelected && (
                 <div className="absolute top-0 right-0 w-2 h-2 bg-[#DFFF00]" />
              )}
               {/* Decorative "Has Urgent" Marker */}
               {hasUrgent && !isSelected && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border border-black rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      <div className="relative">
         {/* Skewed separator */}
         <div className="absolute top-[-20px] left-[-10%] w-[120%] h-12 bg-black -rotate-3 z-0" />
         
         <div className="relative z-10">
            <EventList 
                selectedDate={selectedDate} 
                events={selectedDateEvents} 
                onAddEvent={openAddModal}
                onEditEvent={openEditModal}
                onDeleteEvent={handleDeleteEvent}
            />
         </div>
      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        selectedDate={selectedDate}
      />

      <SyncModal 
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onExport={downloadICS}
        onImport={handleImportICS}
        subscriptions={subscriptions}
        onAddSubscription={handleAddSubscription}
        onRemoveSubscription={handleRemoveSubscription}
        onSyncAll={handleSyncAll}
      />
      
      {/* Sticky Action Button (FAB) - Positioned safely inside container bounds */}
      <div className="fixed bottom-6 right-6 z-50 md:absolute md:bottom-8 md:right-8">
        <BrutalistButton 
            onClick={openAddModal} 
            className="rounded-full w-16 h-16 flex items-center justify-center !p-0 border-4 bg-[#DFFF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Zap size={32} fill="black" />
        </BrutalistButton>
      </div>

    </div>
  );
};

export default App;