// hooks/useChat.ts
import { useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatConfig {
  initialMessages?: Message[];
  autoScroll?: boolean;
  typingDelay?: number;
}

export const useChat = (config: ChatConfig = {}) => {
  const {
    initialMessages = [],
    autoScroll = true,
    typingDelay = 1000,
  } = config;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (text: string, responseGenerator?: (input: string) => Promise<string> | string) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Generate response
      setTimeout(async () => {
        let responseText = '';
        
        if (responseGenerator) {
          responseText = await responseGenerator(text);
        } else {
          // Default responses
          const defaultResponses = [
            'ขอบคุณสำหรับข้อมูลครับ ผมจะช่วยตรวจสอบให้',
            'เข้าใจแล้วครับ ผมจะช่วยแก้ปัญหานี้ให้',
            'ข้อมูลดีมากครับ กำลังประมวลผล...',
            'ได้เลยครับ ผมจะดำเนินการตามที่คุณต้องการ',
          ];
          responseText = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, typingDelay);
    },
    [typingDelay]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  return {
    messages,
    isTyping,
    isOpen,
    messagesEndRef,
    toggleChat,
    sendMessage,
    clearMessages,
    addMessage,
    scrollToBottom,
  };
};
