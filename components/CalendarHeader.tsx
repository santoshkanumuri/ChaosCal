import React, { useRef } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { BrutalistButton } from './BrutalistButton';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onJumpToMonth: (date: Date) => void;
  onSync: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onJumpToMonth,
  onSync
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month] = e.target.value.split('-').map(Number);
      onJumpToMonth(new Date(year, month - 1, 1));
    }
  };

  return (
    <div className="relative mb-6 p-4 border-b-4 border-black bg-white flex flex-col gap-4 z-20">
      {/* Decorative "Chaos" Elements */}
      <div className="absolute top-2 right-4 w-16 h-16 bg-black opacity-10 rotate-12 pointer-events-none" />
      <div className="absolute -bottom-4 -left-2 text-6xl font-display font-black text-transparent stroke-black pointer-events-none opacity-20 select-none" style={{ WebkitTextStroke: '2px black' }}>
        {format(currentDate, 'MM')}
      </div>

      {/* Main Layout: Flex Wrap to handle long month names gracefully */}
      <div className="flex flex-wrap items-end justify-between gap-y-4 gap-x-4 z-30 relative w-full">
        
        {/* Title Group */}
        <div className="flex flex-col relative group flex-grow md:flex-grow-0 min-w-[200px]">
          <span className="text-xs font-mono font-bold bg-black text-white px-1 w-fit mb-1 -rotate-2">
            CURRENT_CONTEXT
          </span>
          <div className="relative w-full">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black uppercase leading-none tracking-tighter cursor-pointer hover:text-[#DFFF00] transition-colors w-full">
              {format(currentDate, 'MMMM')}
              <span className="inline-block ml-2 text-xl sm:text-2xl font-mono text-gray-500 group-hover:text-black align-baseline">
                {format(currentDate, 'yyyy')}
              </span>
            </h1>
            {/* Overlay Input for Main Title */}
            <input 
              ref={dateInputRef}
              type="month" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleDateChange}
              value={format(currentDate, 'yyyy-MM')}
              aria-label="Choose month"
            />
          </div>
        </div>
        
        {/* Controls Group */}
        {/* w-full on mobile ensures spacing, auto on desktop keeps it tight */}
        <div className="flex flex-wrap items-end justify-between md:justify-end gap-3 w-full md:w-auto shrink-0">
          
          {/* Jump / Now Group */}
          <div className="flex gap-2">
             <div className="relative">
                <BrutalistButton variant="secondary" className="text-[10px] md:text-xs py-2 px-3 -rotate-1 relative z-0 whitespace-nowrap">
                    JUMP
                </BrutalistButton>
                {/* Overlay Input for Jump Button */}
                <input 
                  ref={jumpInputRef}
                  type="month" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleDateChange}
                  value={format(currentDate, 'yyyy-MM')}
                  title="Jump to month"
                />
             </div>
             <BrutalistButton onClick={onToday} variant="secondary" className="text-[10px] md:text-xs py-2 px-3 rotate-2 whitespace-nowrap">
                NOW
            </BrutalistButton>
          </div>

          {/* Nav / Sync Group */}
          <div className="flex gap-2">
             <BrutalistButton onClick={onSync} variant="secondary" className="p-2 border-black" title="Sync / Export">
                <RefreshCw size={18} strokeWidth={3} />
            </BrutalistButton>
            <BrutalistButton onClick={onPrevMonth} variant="primary" className="p-2">
              <ChevronLeft size={18} strokeWidth={3} />
            </BrutalistButton>
            <BrutalistButton onClick={onNextMonth} variant="primary" className="p-2">
              <ChevronRight size={18} strokeWidth={3} />
            </BrutalistButton>
          </div>

        </div>
      </div>
    </div>
  );
};