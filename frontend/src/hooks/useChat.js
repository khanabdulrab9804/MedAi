import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { isValidMongoId, isValidSessionId } from '../utils/ids';

const SESSION_KEY = 'medai-session-id';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem(SESSION_KEY) || null
  );
  const [suggestedFollowUps, setSuggestedFollowUps] = useState([]);

  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(SESSION_KEY, sessionId);
    api
      .getChatHistory(sessionId)
      .then((res) => {
        if (res.data?.messages?.length) {
          setMessages(res.data.messages);
        }
      })
      .catch(() => {});
  }, []);

  const sendMessage = useCallback(
    async (text, medicineId = null) => {
      if (!text?.trim() || loading) return;

      const userMsg = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setTyping(true);
      setError(null);

      try {
        const payload = { message: text.trim() };
        if (sessionId && isValidSessionId(sessionId)) payload.sessionId = sessionId;
        if (medicineId && isValidMongoId(medicineId)) payload.medicineId = medicineId;

        const res = await api.sendChat(payload);

        if (!res?.data?.reply) {
          throw new Error('Empty response from server. Is the backend running?');
        }

        const newSessionId = res.data.sessionId;
        if (newSessionId && isValidSessionId(newSessionId)) {
          setSessionId(newSessionId);
          localStorage.setItem(SESSION_KEY, newSessionId);
        }

        // Typing animation delay for natural feel
        await new Promise((r) => setTimeout(r, 600));

        if (res.data.suggestedFollowUps) setSuggestedFollowUps(res.data.suggestedFollowUps);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply,
            medicines: res.data.medicines,
            confidence: res.data.confidence,
            sources: res.data.sources,
            agent: res.data.agent,
            usedRag: res.data.usedRag,
            citations: res.data.citations,
          },
        ]);
        return res.data;
      } catch (err) {
        const msg =
          err.message ||
          'Cannot reach the server. Run: npm run dev:backend (port 5000)';
        setError(msg);
        if (msg.includes('session') || msg.includes('Invalid')) {
          localStorage.removeItem(SESSION_KEY);
          setSessionId(null);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: msg,
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
        setTyping(false);
      }
    },
    [loading, sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setSuggestedFollowUps([]);
    setSessionId(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return {
    messages,
    loading,
    typing,
    error,
    sessionId,
    sendMessage,
    clearChat,
    setMessages,
    suggestedFollowUps,
  };
}
