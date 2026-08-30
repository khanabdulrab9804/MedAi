const STORAGE_KEY = 'medai-recent-searches';
const MAX_ITEMS = 8;

export function useRecentSearches() {
  const getRecent = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const addRecent = (query) => {
    if (!query?.trim()) return;
    const trimmed = query.trim();
    const list = getRecent().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    list.unshift(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  };

  const clearRecent = () => localStorage.removeItem(STORAGE_KEY);

  return { getRecent, addRecent, clearRecent };
}
