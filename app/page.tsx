'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Humanizer from '@/components/Humanizer';
import BatchHumanizer from '@/components/BatchHumanizer';
import Detector from '@/components/Detector';
import History from '@/components/History';
import Settings from '@/components/Settings';
import ObservabilityDashboard from '@/components/ObservabilityDashboard';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';
import { Toast as ToastType, Tab } from '@/lib/types';
import { getTheme, setTheme as saveTheme } from '@/lib/storage';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('humanizer');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const saved = getTheme();
    setThemeState(saved);
    document.documentElement.classList.toggle('light', saved === 'light');
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    saveTheme(nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const showToast = useCallback((type: ToastType['type'], message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <div className={`min-h-screen ${theme} flex flex-col`}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />

      {activeTab === 'humanizer' && (
        <main className="container mx-auto px-4 py-6 max-w-7xl flex-1" id="humanizer-section">
          <Humanizer showToast={showToast} />
        </main>
      )}

      {activeTab === 'batch' && (
        <main className="container mx-auto px-4 py-6 max-w-7xl flex-1">
          <BatchHumanizer showToast={showToast} />
        </main>
      )}

      {activeTab !== 'humanizer' && activeTab !== 'batch' && (
        <main className="container mx-auto px-4 py-6 max-w-7xl flex-1">
          {activeTab === 'detector' && <Detector showToast={showToast} />}
          {activeTab === 'dashboard' && <ObservabilityDashboard showToast={showToast} />}
          {activeTab === 'history' && <History showToast={showToast} setActiveTab={setActiveTab} />}
          {activeTab === 'settings' && <Settings showToast={showToast} />}
        </main>
      )}

      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => <Toast key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
      </div>
      <Footer />
    </div>
  );
}
