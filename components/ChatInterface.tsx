import React, { useEffect, useRef } from 'react';
import { User, Bot, Loader2 } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  language: 'en' | 'ko';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, language }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-6 border-b border-wash-blue/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="font-serif text-2xl font-bold text-watercolor-indigo flex items-center gap-2">
          <Bot className="w-6 h-6 text-watercolor-teal" />
          {language === 'ko' ? '권위 멘토' : 'Authority Mentor'}
        </h2>
        <p className="text-sm text-ink-light mt-1 font-sans">
          {language === 'ko' ? '전문 커리큘럼 구성을 위한 가이드' : 'Your guide to building a demand-driven curriculum'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[90%] md:max-w-[80%] rounded-2xl p-4 text-sm md:text-base leading-relaxed shadow-sm backdrop-blur-md ${
                msg.role === 'user'
                  ? 'bg-watercolor-indigo/90 text-white rounded-br-sm shadow-indigo-100'
                  : 'bg-white/80 text-ink border border-white rounded-bl-sm shadow-stone-100'
              }`}
            >
              <div className="mr-3 mt-1 shrink-0 opacity-80">
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full">
             <div className="bg-white/60 text-ink border border-white rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-3 backdrop-blur-sm">
                <Bot size={16} className="opacity-70 text-watercolor-teal" />
                <span className="text-sm italic text-ink-light flex items-center gap-2">
                    {language === 'ko' ? '생각하는 중...' : 'Mixing the palette...'} <Loader2 className="animate-spin h-4 w-4 text-watercolor-indigo" />
                </span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;