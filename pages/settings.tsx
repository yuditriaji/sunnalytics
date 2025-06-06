import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import localforage from 'localforage';

export default function Settings() {
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    localforage.getItem('darkMode').then(value => {
      const darkMode = value as boolean;
      setIsDarkMode(darkMode || false);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    });
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localforage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleReset = () => {
    localforage.clear();
    setIsDarkMode(false);
    document.documentElement.classList.remove('dark');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg">Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 ${
                isDarkMode ? 'bg-blue-600' : ''
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </div>
          </label>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Reset All Settings
        </button>
      </main>
      <BottomNav />
    </div>
  );
}