import ReactMarkdown from 'react-markdown';
import ChatFeedbackBar from './ChatFeedbackBar';
import SourcePanel from './explainable/SourcePanel';

export default function ChatMessage({ message, sessionId, messageIndex }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
          isUser
            ? 'bg-medai-600 text-white'
            : isError
              ? 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200'
              : 'card text-slate-700 dark:text-slate-200'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {!isError && (
              <SourcePanel
                sources={message.sources}
                confidence={message.confidence}
                agent={message.agent}
                usedRag={message.usedRag}
              />
            )}
            {!isError && sessionId && (
              <ChatFeedbackBar sessionId={sessionId} messageIndex={messageIndex} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
