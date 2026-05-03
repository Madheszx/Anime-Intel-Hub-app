/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import SparksScreen from './screens/SparksScreen';
import AniBaseScreen from './screens/AniBaseScreen';
import AnimeDetailsScreen from './screens/AnimeDetailsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AdminUploadScreen from './screens/AdminUploadScreen';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [navigationStack, setNavigationStack] = useState<string[]>(['home']);
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);

  // Sync activeTab with stack top
  useEffect(() => {
    const currentPath = navigationStack[navigationStack.length - 1];
    if (['home', 'news', 'sparks', 'anibase', 'settings', 'admin'].includes(currentPath)) {
       setActiveTab(currentPath);
    } else if (currentPath.startsWith('anime-')) {
       setActiveTab('anibase');
    }
  }, [navigationStack]);

  const navigateTo = (path: string) => {
    if (path === 'admin') {
      setNavigationStack([...navigationStack, 'admin']);
      return;
    }
    
    if (['home', 'news', 'sparks', 'anibase', 'settings'].includes(path)) {
      setNavigationStack([path]);
    } else if (path.startsWith('anime-')) {
      const id = parseInt(path.split('-')[1]);
      setSelectedAnimeId(id);
      setNavigationStack([...navigationStack, path]);
    }
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop();
      const prevPath = newStack[newStack.length - 1];
      if (prevPath.startsWith('anime-')) {
        const id = parseInt(prevPath.split('-')[1]);
        setSelectedAnimeId(id);
      }
      setNavigationStack(newStack);
    }
  };

  const currentPath = navigationStack[navigationStack.length - 1];

  const renderActiveScreen = () => {
    if (currentPath === 'admin') return <AdminUploadScreen onBack={goBack} />;
    if (currentPath.startsWith('anime-') && selectedAnimeId) {
      return <AnimeDetailsScreen animeId={selectedAnimeId} onBack={goBack} onNavigate={(id) => navigateTo(`anime-${id}`)} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={navigateTo} />;
      case 'news':
        return <NewsScreen />;
      case 'sparks':
        return <SparksScreen />;
      case 'anibase':
        return <AniBaseScreen onSelectAnime={(id) => navigateTo(`anime-${id}`)} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  const showNav = !currentPath.startsWith('anime-');

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <main className="max-w-lg mx-auto bg-black min-h-screen relative shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>

        {showNav && (
          <BottomNav currentTab={activeTab} setTab={navigateTo} />
        )}
      </main>
    </div>
  );
}

