import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import Button from '@/components/ui/button';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    status: 'online' | 'offline';
  } | null;
}

export default function ChatDrawer({ isOpen, onClose, recipient }: ChatDrawerProps) {
  const [message, setMessage] = useState('');

  if (!isOpen || !recipient) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // The message sending integration with the backend socket/API goes here.
    console.log(`Sending message to ${recipient.name}: ${message}`);
    setMessage('');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {recipient.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{recipient.name}</h3>
              <div className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${recipient.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500 capitalize">{recipient.status}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area (Placeholder) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col justify-end">
          <div className="text-center text-sm text-gray-400 mb-4">
            This is the beginning of your conversation with {recipient.name}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSend} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button type="submit" className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
