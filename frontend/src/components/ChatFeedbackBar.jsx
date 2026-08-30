import { useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function ChatFeedbackBar({ sessionId, messageIndex }) {
  const { t } = useLanguage();
  const [sent, setSent] = useState(null);

  const send = async (rating) => {
    try {
      await api.submitFeedback({ rating, sessionId, messageIndex });
      setSent(rating);
    } catch {
      setSent('error');
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 dark:border-slate-700">
      <span className="text-xs text-slate-500">{t.wasHelpful}</span>
      <button
        type="button"
        disabled={sent}
        onClick={() => send('up')}
        className={`rounded px-2 py-0.5 text-xs ${sent === 'up' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        aria-label="Helpful"
      >
        👍
      </button>
      <button
        type="button"
        disabled={sent}
        onClick={() => send('down')}
        className={`rounded px-2 py-0.5 text-xs ${sent === 'down' ? 'bg-red-100 text-red-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        aria-label="Not helpful"
      >
        👎
      </button>
      <span className="text-xs text-slate-400">{t.reportIssue}</span>
    </div>
  );
}
