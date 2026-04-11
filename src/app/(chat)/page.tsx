'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { useSSEChat } from '@/hooks/useSSEChat';
import { STORAGE_KEYS } from '@/lib/constants';

export default function ChatPage() {
  const { messages, isStreaming, sendMessage, clearMessages, loadMessages } =
    useSSEChat();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (stored) setSessionId(stored);
  }, []);

  // Listen for session events from SSE
  useEffect(() => {
    function handleSession(e: Event) {
      const id = (e as CustomEvent<string>).detail;
      setSessionId(id);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
    }
    window.addEventListener('koovis:session', handleSession);
    return () => window.removeEventListener('koovis:session', handleSession);
  }, []);

  const handleSend = useCallback(
    (content: string, fileIds?: string[]) => {
      sendMessage(content, sessionId, fileIds);
    },
    [sessionId, sendMessage]
  );

  const handleNewChat = useCallback(() => {
    clearMessages();
    setSessionId(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  }, [clearMessages]);

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <ChatMessages messages={messages} isStreaming={isStreaming} />
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
      />
    </div>
  );
}
