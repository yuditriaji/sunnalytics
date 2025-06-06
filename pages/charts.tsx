import React from 'react';
import BottomNav from '../components/BottomNav';

export default function Charts() {
  return (
    <div className="min-h-screen flex flex-col pb-16 bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <h1 className="text-xl font-bold text-white">Charts</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="text-gray-300">Charts Page - Coming Soon</div>
      </main>
      <BottomNav onFilterClick={() => {}} />
    </div>
  );
}