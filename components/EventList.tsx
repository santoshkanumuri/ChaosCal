import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { Plus, Trash2, Clock, Edit2 } from 'lucide-react';

interface EventListProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventList: React.FC<EventListProps> = ({
  selectedDate,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  return (
    <div className="mt-8 p-4 bg-black text-white relative overflow-hidden min-h-[300px]">
      {/* Gritty Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
      </div>

      <div className="relative z-10 flex justify-between items-center mb-6 border-b-2 border-white pb-2">
        <div>
           <p className="font-mono text-sm text-[#DFFF00]">SELECTED_DATA_STREAM</p>
           <h2 className="text-3xl font-display font-bold uppercase">
             {format(selectedDate, 'EEE, dd MMM')}
           </h2>
        </div>
        <BrutalistButton onClick={onAddEvent} variant="primary" rotate>
          <Plus size={20} strokeWidth={4} />
        </BrutalistButton>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-700">
          <p className="font-mono text-gray-500 uppercase tracking-widest">No Signal</p>
          <p className="text-xs text-gray-600 mt-2">Time is empty here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-20">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="group relative bg-white text-black border-l-8 border-[#DFFF00] p-4 shadow-[4px_4px_0px_0px_#333] hover:translate-x-1 transition-transform"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-black ${
                      event.type === 'urgent' ? 'bg-red-500 text-white' : 
                      event.type === 'work' ? 'bg-gray-200' : 'bg-[#DFFF00]'
                    }`}>
                      {event.type}
                    </span>
                    <span className="flex items-center text-xs font-mono font-bold">
                      <Clock size={12} className="mr-1" />
                      {format(event.date, 'HH:mm')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display leading-tight">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm font-mono mt-1 text-gray-600 border-l-2 border-black pl-2 ml-1">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button 
                    onClick={() => onEditEvent(event)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};