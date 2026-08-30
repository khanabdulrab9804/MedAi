import { useCallback, useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../hooks/useChat';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { isValidMongoId } from '../utils/ids';

const PORTAL_CONFIG = {
  doctor: {
    title: 'Clinical Assistant',
    welcome: 'Clinical medicine Q&A',
    description:
      'Search medicines, review side effects and interactions, and get evidence-based answers from the knowledge base.',
    badge: 'Doctor',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  },
  patient: {
    title: 'My Medicine Helper',
    welcome: 'How can we help you today?',
    description:
      'Ask simple questions about your medicines — dosage, side effects, and how to take them safely.',
    badge: 'Patient',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  },
};

export default function MedicineChatPage({ portal = 'guest', hideHeader = false }) {
  const config = PORTAL_CONFIG[portal] || null;
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ generic: '', manufacturer: '' });
  const [medicines, setMedicines] = useState([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const { messages, loading, typing, error, sessionId, sendMessage, clearChat, suggestedFollowUps } =
    useChat();
  const { getRecent, addRecent, clearRecent } = useRecentSearches();

  const fetchMedicines = useCallback(async () => {
    setSearchLoading(true);
    setSearchError(null);
    const params = { q: searchQuery };
    if (filters.generic) params.generic = filters.generic;
    if (filters.manufacturer) params.manufacturer = filters.manufacturer;

    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const res = await api.searchMedicines(params);
        setMedicines(res.data || []);
        setSearchError(null);
        setSearchLoading(false);
        return;
      } catch (err) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        setMedicines([]);
        setSearchError(err.message);
        setSearchLoading(false);
      }
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchMedicines(), 300);
    return () => clearTimeout(t);
  }, [fetchMedicines]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && searchError) fetchMedicines();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [searchError, fetchMedicines]);

  useEffect(() => {
    setRecentList(getRecent());
  }, [searchQuery]);

  const handleSearchSubmit = (q) => {
    setSearchQuery(q);
    addRecent(q);
    setRecentList(getRecent());
  };

  const handleSend = async (text) => {
    addRecent(text);
    setRecentList(getRecent());
    const medId = selectedMedicine?._id;
    await sendMessage(text, isValidMongoId(medId) ? medId : null);
  };

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setSidebarOpen(false);
    handleSend(`Tell me about ${medicine.name}`);
  };

  const pageTitle = config?.title || 'Medicine Assistant';
  const welcomeTitle = config?.welcome || 'Ask about medicines in our database';
  const welcomeText =
    config?.description ||
    'Search a medicine on the left or type a question. Answers are based only on verified medicine data we provide.';

  return (
    <div className={`flex flex-col ${hideHeader ? 'h-full min-h-0 flex-1' : 'min-h-screen'}`}>
      {!hideHeader && <Header onMenuClick={() => setSidebarOpen(true)} />}
      <div
        className={`flex w-full flex-1 min-h-0 overflow-hidden ${hideHeader ? 'h-full' : 'mx-auto max-w-7xl'}`}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          filters={filters}
          onFiltersChange={setFilters}
          medicines={medicines}
          loading={searchLoading}
          selectedMedicine={selectedMedicine}
          onSelectMedicine={handleSelectMedicine}
          recentSearches={recentList}
          onRecentClick={(q) => {
            setSearchQuery(q);
            handleSearchSubmit(q);
          }}
          onClearRecent={() => {
            clearRecent();
            setRecentList([]);
          }}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-medium text-slate-900 dark:text-white">{pageTitle}</h1>
                  {config && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${config.badgeClass}`}>
                      {config.badge}
                    </span>
                  )}
                </div>
                {user && (
                  <p className="text-xs text-slate-500">
                    Signed in as <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                  </p>
                )}
                {selectedMedicine && (
                  <p className="text-xs text-medai-600">Focused on: {selectedMedicine.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  clearChat();
                  setSelectedMedicine(null);
                }}
                className="text-xs text-slate-500 hover:text-medai-600"
              >
                Clear chat
              </button>
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-medai-100 dark:bg-medai-900/40">
                  <svg className="h-8 w-8 text-medai-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{welcomeTitle}</h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">{welcomeText}</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} sessionId={sessionId} messageIndex={i} />
              ))
            )}
            {typing && <TypingIndicator />}
          </div>

          {(error || searchError) && (
            <p className="shrink-0 px-4 pb-2 text-center text-xs text-red-600 dark:text-red-400">
              {error || searchError}
            </p>
          )}

          {suggestedFollowUps?.length > 0 && (
            <div className="flex shrink-0 flex-wrap gap-2 px-4 pb-2">
              {suggestedFollowUps.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-medai-200 bg-medai-50 px-3 py-1 text-xs text-medai-800 dark:border-medai-800 dark:bg-medai-900/40 dark:text-medai-200"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="shrink-0">
            <ChatInput onSend={handleSend} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
