
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-xl p-4 shadow-sm transition-all duration-300 ${
        isUser 
          ? 'bg-black text-white rounded-tr-none border border-black' 
          : 'bg-white text-stone-900 border border-stone-100 rounded-tl-none ring-1 ring-stone-100/50'
      }`}>
        <div className="space-y-3">
          {message.parts.map((part, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-tight text-sm tracking-tight break-words">
              {part.text && (
                <div className="prose prose-sm max-w-none text-inherit">
                  {part.text.split('\n').map((line, i) => (
                    <p key={i} className={`mb-1 last:mb-0 ${line.trim().startsWith('-') || line.trim().startsWith('•') ? 'ml-2 -indent-2' : ''}`}>
                      {line.split(/(\*\*.*?\*\*)/g).map((chunk, j) => {
                        if (chunk.startsWith('**') && chunk.endsWith('**')) {
                          return <strong key={j} className="font-bold text-[#C5A059] uppercase tracking-wider">{chunk.slice(2, -2)}</strong>;
                        }
                        return chunk;
                      })}
                    </p>
                  ))}
                </div>
              )}
              {part.inlineData && (
                <div className="mt-2 group relative overflow-hidden rounded-md border border-stone-100">
                  <img 
                    src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                    alt="Style Reference" 
                    className="max-w-full h-auto grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={`text-[8px] mt-2 font-medium opacity-30 uppercase tracking-[0.25em] ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
