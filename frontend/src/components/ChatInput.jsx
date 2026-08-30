import { useState } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';

const SUGGESTIONS = [
  'Can I use Dolo 650 for fever?',
  'What are the side effects of Pan 40?',
  'How should I store Azithral 500?',
];

export default function ChatInput({ onSend, loading, disabled }) {
  const [text, setText] = useState('');

  const { listening, supported, startListening, stopListening } = useVoiceInput((transcript) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSend(s)}
            disabled={loading || disabled}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 transition hover:border-medai-300 hover:text-medai-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400"
          >
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask about a medicine in our database..."
          rows={1}
          disabled={loading || disabled}
          className="input-field min-h-[44px] max-h-32 resize-none py-3"
          aria-label="Chat message"
        />
        {supported && (
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`shrink-0 rounded-xl p-2.5 transition ${
              listening
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        )}
        <button type="submit" disabled={!text.trim() || loading || disabled} className="btn-primary shrink-0">
          Send
        </button>
      </form>
    </div>
  );
}
