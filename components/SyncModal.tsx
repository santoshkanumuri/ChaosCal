import React, { useRef, useState } from 'react';
import { BrutalistButton } from './BrutalistButton';
import { X, Download, Upload, Cloud, RefreshCw, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { CalendarSubscription } from '../types';
import { format } from 'date-fns';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  subscriptions: CalendarSubscription[];
  onAddSubscription: (url: string, name: string, useProxy: boolean) => void;
  onRemoveSubscription: (id: string) => void;
  onSyncAll: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  subscriptions,
  onAddSubscription,
  onRemoveSubscription,
  onSyncAll
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Subscription Form State
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [useProxy, setUseProxy] = useState(true);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImport(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeedUrl && newFeedName) {
      onAddSubscription(newFeedUrl, newFeedName, useProxy);
      setNewFeedUrl('');
      setNewFeedName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#DFFF00] border-4 border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-black hover:text-white transition-colors border-2 border-black z-10"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* Left Column: Manual File Operations */}
        <div className="flex-1 flex flex-col gap-6 min-w-[280px]">
            <h2 className="text-4xl font-display font-black uppercase text-black leading-[0.8]">
            DATA_<br />PORT
            </h2>
            
            {/* Export Section */}
            <div className="bg-white p-4 border-2 border-black">
                <h3 className="font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <Download size={20} /> SNAPSHOT
                </h3>
                <p className="text-xs font-mono text-gray-600 mb-4 leading-tight">
                Generate static .ICS file. Compatible with all major calendar protocols.
                </p>
                <BrutalistButton onClick={onExport} variant="primary" className="w-full flex justify-center items-center gap-2">
                DOWNLOAD
                </BrutalistButton>
            </div>

            {/* Import Section */}
            <div 
                className={`bg-white p-4 border-2 border-black transition-colors ${dragActive ? 'bg-gray-100' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <h3 className="font-mono font-bold text-lg mb-2 flex items-center gap-2">
                <Upload size={20} /> INJECT
                </h3>
                <p className="text-xs font-mono text-gray-600 mb-4 leading-tight">
                Ingest .ICS file. Incoming data will merge with current chaos.
                </p>
                
                <input 
                ref={fileInputRef}
                type="file"
                accept=".ics"
                className="hidden"
                onChange={handleChange}
                />
                
                <BrutalistButton 
                onClick={() => fileInputRef.current?.click()} 
                variant="secondary" 
                className="w-full flex justify-center items-center gap-2"
                >
                SELECT FILE
                </BrutalistButton>
            </div>
        </div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block w-1 bg-black opacity-20" />

        {/* Right Column: Live Feeds */}
        <div className="flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-end">
                <h2 className="text-2xl font-display font-black uppercase text-black leading-none">
                    NETWORK<br/>CHANNELS
                </h2>
                <button 
                    onClick={onSyncAll}
                    className="p-2 border-2 border-black hover:bg-white active:translate-y-1 transition-all"
                    title="Force Sync All"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="bg-black text-white p-4 border-2 border-white/50">
                <h3 className="font-mono font-bold text-xs uppercase mb-3 text-[#DFFF00]">Add Subscription</h3>
                <form onSubmit={handleAddFeed} className="flex flex-col gap-2">
                    <input 
                        value={newFeedName}
                        onChange={(e) => setNewFeedName(e.target.value)}
                        placeholder="Feed Name (e.g. Work)"
                        className="bg-[#222] border border-gray-600 p-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#DFFF00]"
                        required
                    />
                    <input 
                        value={newFeedUrl}
                        onChange={(e) => setNewFeedUrl(e.target.value)}
                        placeholder="https://calendar.google.com/..."
                        className="bg-[#222] border border-gray-600 p-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#DFFF00]"
                        required
                    />
                    
                    <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            id="proxy" 
                            checked={useProxy} 
                            onChange={(e) => setUseProxy(e.target.checked)}
                            className="accent-[#DFFF00]"
                        />
                        <label htmlFor="proxy" className="text-[10px] font-mono text-gray-400">
                            Use CORS Proxy (Recommended for Google/Outlook)
                        </label>
                    </div>

                    <BrutalistButton type="submit" variant="primary" className="text-xs py-1">
                        CONNECT_STREAM
                    </BrutalistButton>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-2">
                {subscriptions.length === 0 ? (
                    <div className="border-2 border-dashed border-black/20 p-4 text-center">
                        <p className="font-mono text-[10px] text-gray-600 uppercase">No active uplinks.</p>
                    </div>
                ) : (
                    subscriptions.map(sub => (
                        <div key={sub.id} className="bg-white border-2 border-black p-2 flex justify-between items-center group relative">
                            {/* Status Indicator Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                sub.status === 'active' ? 'bg-green-500' : 
                                sub.status === 'error' ? 'bg-red-500' : 'bg-yellow-400'
                            }`} />
                            
                            <div className="pl-3 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm uppercase truncate">{sub.name}</h4>
                                    {sub.status === 'error' && <AlertTriangle size={12} className="text-red-500" />}
                                </div>
                                <p className="font-mono text-[10px] text-gray-500 truncate">{sub.url}</p>
                                <p className="font-mono text-[9px] text-gray-400 mt-0.5">
                                    LAST_SYNC: {sub.lastSynced ? format(sub.lastSynced, 'HH:mm') : 'NEVER'}
                                </p>
                            </div>

                            <button 
                                onClick={() => onRemoveSubscription(sub.id)}
                                className="p-2 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

             <div className="flex items-center gap-2 mt-auto pt-2 opacity-50">
                <Globe size={12} />
                <span className="font-mono text-[9px] uppercase leading-tight">
                  Auto-sync active every 60m. <br/>Keep window open for live updates.
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};