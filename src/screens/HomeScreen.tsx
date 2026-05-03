import { Newspaper, Film, Star, Upload, Info, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { getTrendingAnime } from '../services/animeService';
import { Anime } from '../types';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [trending, setTrending] = useState<Anime[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getTrendingAnime().then(setTrending);
  }, []);

  // Auto-swipe logic
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(trending.length, 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [trending]);

  const navItems = [
    { id: 'news', title: 'Latest Anime News', icon: Newspaper, desc: 'Fresh updates from crunchyroll', tab: 'news', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 'edits', title: 'Anime Edits Library', icon: Film, desc: '100+ shorts in 16:9 grid', tab: 'sparks', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'sparks_ratings', title: 'Sparks Episode Ratings', icon: Star, desc: 'Top-rated episodes, TikTok-style', tab: 'sparks', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'admin', title: 'Admin Hub', icon: Upload, desc: 'Manage content (Auth Required)', tab: 'admin', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  const featuredAnime = (trending || []).slice(0, 6);

  return (
    <div className="pb-24">
      {/* Hero Carousel */}
      <div className="relative h-[380px] w-full overflow-hidden bg-obsidian-900">
        <AnimatePresence initial={false} mode="wait">
          {featuredAnime.length > 0 ? (
            <motion.div
              key={featuredAnime[currentSlide].mal_id}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
              onClick={() => onNavigate(`anime-${featuredAnime[currentSlide].mal_id}`)}
            >
              {/* Background Backdrop */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] scale-105"
                style={{ backgroundImage: `url(${featuredAnime[currentSlide].images?.jpg?.large_image_url})` }}
              />
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-obsidian-900/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian-900 via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-12 left-8 right-8 z-10">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/30 mb-4 inline-block backdrop-blur-md">
                    Trending Now
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-white leading-none mb-3 tracking-tighter">
                    {featuredAnime[currentSlide].title_english || featuredAnime[currentSlide].title}
                  </h1>
                  <p className="text-gray-300 text-[11px] font-medium max-w-[320px] line-clamp-2 leading-relaxed opacity-80 mb-6">
                    {featuredAnime[currentSlide].synopsis}
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                       onClick={(e) => { e.stopPropagation(); onNavigate(`anime-${featuredAnime[currentSlide].mal_id}`); }}
                       className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all active:scale-95"
                    >
                      <Info size={14} />
                      Details
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-obsidian-800 animate-pulse" />
          )}
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {featuredAnime.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
              className={`relative h-1 overflow-hidden rounded-full transition-all duration-500 bg-white/20 ${
                idx === currentSlide ? 'w-10' : 'w-2'
              }`}
            >
              {idx === currentSlide && (
                <motion.div
                  key={`progress-${idx}-${currentSlide}`}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="absolute inset-0 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8">
        <header className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
             <Star size={18} fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Anime <span className="text-indigo-400">Intel Hub</span></h2>
        </header>

        <div className="flex flex-col gap-4">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.tab)}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-obsidian-800 border border-white/5 relative overflow-hidden active:bg-white/[0.02] transition-colors"
            >
              <div className="absolute inset-0 border border-transparent group-hover:border-indigo-500 transition-colors rounded-2xl" />
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${item.bg} ${item.color} shrink-0`}>
                <item.icon size={24} />
              </div>
              <div className="text-left flex-1">
                <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">{item.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Trending Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg tracking-tight">Current Trending</h3>
            <button
              onClick={() => onNavigate('anibase')}
              className="text-indigo-400 text-xs font-bold"
            >
              View All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {(trending || []).map((anime) => (
              <motion.div
                key={anime.mal_id}
                whileHover={{ y: -5 }}
                className="shrink-0 w-36 cursor-pointer"
                onClick={() => onNavigate(`anime-${anime.mal_id}`)}
              >
                <div className="relative aspect-[3/4] bg-obsidian-800 rounded-xl overflow-hidden mb-2">
                  <img
                    src={anime.images?.jpg?.large_image_url || undefined}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541560052-3744e4e98e44?auto=format&fit=crop&q=80&w=800'}
                  />
                  <div className="absolute top-2 right-2 bg-obsidian-800/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 shadow-lg border border-white/10">
                    <Star size={10} className="fill-indigo-400 text-indigo-400" />
                    {anime.score}
                  </div>
                </div>
                <h5 className="text-white font-bold text-[11px] line-clamp-1">{anime.title_english || anime.title}</h5>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">{anime.episodes || '?'} Episodes • 2 Seasons</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
