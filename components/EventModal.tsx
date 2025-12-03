import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { BrutalistButton } from './BrutalistButton';
import { X } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  initialEvent?: CalendarEvent | null;
  selectedDate: Date;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  selectedDate
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('work');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setType(initialEvent.type);
      setTime(initialEvent.date.toTimeString().slice(0, 5));
      setDescription(initialEvent.description || '');
    } else {
      setTitle('');
      setType('work');
      setTime('12:00');
      setDescription('');
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create a new date object based on selectedDate but with new time
    const eventDate = new Date(selectedDate);
    eventDate.setHours(hours);
    eventDate.setMinutes(minutes);

    onSave({
      ...initialEvent,
      title,
      type,
      date: eventDate,
      description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-black hover:text-white transition-colors"
        >
          <X size={24} strokeWidth={3} />
        </button>

        <h2 className="text-3xl font-display font-black uppercase mb-6 bg-[#DFFF00] inline-block px-2 -rotate-1 border-2 border-transparent">
          {initialEvent ? 'EDIT_PROTOCOL' : 'NEW_ENTRY'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs font-bold uppercase">Event Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-black p-2 font-mono text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_black] transition-shadow"
              placeholder="MEETING_BETA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs font-bold uppercase">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
                className="border-2 border-black p-2 font-mono text-sm bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_black] appearance-none rounded-none"
              >
                <option value="work">WORK</option>
                <option value="personal">PERSONAL</option>
                <option value="urgent">URGENT</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs font-bold uppercase">Time</label>
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-2 border-black p-2 font-mono text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_black]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs font-bold uppercase">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-black p-2 font-mono text-sm h-24 focus:outline-none focus:shadow-[4px_4px_0px_0px_black] resize-none"
              placeholder="Details..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <BrutalistButton type="button" variant="secondary" onClick={onClose}>
              CANCEL
            </BrutalistButton>
            <BrutalistButton type="submit" variant="primary">
              SAVE_DATA
            </BrutalistButton>
          </div>
        </form>
      </div>
    </div>
  );
};