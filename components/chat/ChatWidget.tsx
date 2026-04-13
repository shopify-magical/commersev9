// components/chat/ChatWidget.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Globe } from 'lucide-react';
import { getChatResponse, quickActions } from '@/lib/chat-responses';

interface Message {
  id: string;
  text: string;
  textTh?: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

type Language = 'th' | 'en';

export const ChatWidget = ({ isOpen = false, onToggle }: ChatWidgetProps) => {
  const [language, setLanguage] = useState<Language>('th');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to Rubber Plus! I can help you find the perfect rubber products.',
      textTh: 'สวัสดีค่ะ! ยินดีต้อนรับสู่ Rubber Plus ผมช่วยคุณหาสินค้ายางพาราที่เหมาะสมได้ค่ะ',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Use centralized response logic
    setTimeout(() => {
      const response = getChatResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.en,
        textTh: response.th,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const CustomIcon = ({ iconName }: { iconName: string }) => {
    const iconPaths: Record<string, string> = {
      'trending-up': '/images/chat-icon-trending.svg',
      'shield': '/images/chat-icon-shield.svg',
      'users': '/images/chat-icon-users.svg',
      'leaf': '/images/chat-icon-leaf.svg',
      'message': '/images/chat-icon-leaf.svg',
    };
    
    return (
      <img 
        src={iconPaths[iconName] || iconPaths['leaf']} 
        alt={iconName}
        className="w-4 h-4"
      />
    );
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-jade text-white rounded-full shadow-gold hover:shadow-gold-lg hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        >
          <CustomIcon iconName="message" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-gold-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md bg-white rounded-2xl shadow-gold border border-cream-200 z-50 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-jade text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CustomIcon iconName="leaf" />
              </div>
              <div>
                <h3 className="font-display font-bold">Rubber Plus AI</h3>
                <p className="text-xs text-white/80">{language === 'th' ? 'ผู้ช่วยอัจฉริยะ' : 'AI Assistant'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition text-xs flex items-center gap-1"
                title={language === 'th' ? 'Switch to English' : 'สลับเป็นภาษาไทย'}
              >
                <Globe className="w-3 h-3" />
                {language === 'th' ? 'EN' : 'ไทย'}
              </button>
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-cream-50 chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${
                  message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    message.sender === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-primary-700 border border-cream-200'
                  }`}
                >
                  <p className="text-sm">
                    {message.sender === 'assistant' && language === 'th' && message.textTh
                      ? message.textTh
                      : message.text}
                  </p>
                  {message.sender === 'assistant' && message.textTh && language === 'en' && (
                    <p className="text-xs mt-1 opacity-60 italic">{message.textTh}</p>
                  )}
                  <p className="text-xs mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-cream-200 p-3 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-white border-t border-cream-200">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(language === 'th' ? action.actionTh : action.actionEn)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-cream-50 hover:bg-cream-100 transition text-xs"
                >
                  <span className="text-primary-600"><CustomIcon iconName={action.icon} /></span>
                  <span className="text-primary-700 font-medium">
                    {language === 'th' ? action.labelTh : action.labelEn}
                  </span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type your message...'}
                className="flex-1 px-4 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
