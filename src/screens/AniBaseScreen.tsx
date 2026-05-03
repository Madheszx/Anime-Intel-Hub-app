import { Search, Info, Calendar, PlayCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { searchAnime, getPopularAnime } from '../services/animeService';
import { Anime } from '../types';

interface AniBaseScreenProps {
  onSelectAnime: (id: number) => void;
}

export default function AniBaseScreen({ onSelectAnime }: AniBaseScreenProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [catalogBatch, setCatalogBatch] = useState(0);
  const [searchBatch, setSearchBatch] = useState(0);

  useEffect(() => {
    setLoading(true);
    getPopularAnime().then(data => {
      setPopular(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearchBatch(0);
    const data = await searchAnime(query, filterType, filterStatus);
    setResults(data || []);
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchBatch(0);
    setFilterType('');
    setFilterStatus('');
  };

  return (
    <div className="pb-24 pt-6 px-6">
      <h1 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">AnimeBase</h1>

      <div className="space-y-4 mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search for anime by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-obsidian-800 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600 shadow-xl"
          />
          {query && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: 'Any Type', value: '' },
            { label: 'TV', value: 'tv' },
            { label: 'Movie', value: 'movie' },
            { label: 'OVA', value: 'ova' },
            { label: 'Special', value: 'special' }
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setFilterType(t.value);
                if (query) handleSearch();
              }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                filterType === t.value 
                  ? 'bg-indigo-500 text-black border-indigo-500' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: 'Any Status', value: '' },
            { label: 'Airing', value: 'airing' },
            { label: 'Finished', value: 'complete' },
            { label: 'Upcoming', value: 'upcoming' }
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setFilterStatus(s.value);
                if (query) handleSearch();
              }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                filterStatus === s.value 
                  ? 'bg-indigo-500 text-black border-indigo-500' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      ) : query && (results || []).length > 0 ? (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Search Results</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-[200px]">
              {Array.from({ length: Math.ceil(((results || []).length) / 50) }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setSearchBatch(i)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-wider whitespace-nowrap ${
                    searchBatch === i 
                      ? 'bg-indigo-500 text-black border-indigo-500 shadow-lg shadow-indigo-500/20' 
                      : 'bg-obsidian-800 text-gray-500 border-white/5 hover:text-gray-300'
                  }`}
                >
                  {i * 50 + 1}-{Math.min((i + 1) * 50, (results || []).length)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(results || []).slice(searchBatch * 50, (searchBatch + 1) * 50).map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} onClick={() => onSelectAnime(anime.mal_id)} />
            ))}
          </div>
        </div>
      ) : query && (results || []).length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Search size={64} className="mx-auto mb-4 opacity-10" />
          <p>No results found for "{query}"</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Top Rated Anime</h2>
            <div className="grid grid-cols-2 gap-4">
              {(popular || []).slice(0, 4).map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} onClick={() => onSelectAnime(anime.mal_id)} />
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Full Library</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-[200px]">
                {Array.from({ length: Math.ceil(((popular || []).length) / 50) }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCatalogBatch(i)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-wider whitespace-nowrap ${
                      catalogBatch === i 
                        ? 'bg-indigo-500 text-black border-indigo-500 shadow-lg shadow-indigo-500/20' 
                        : 'bg-obsidian-800 text-gray-500 border-white/5 hover:text-gray-300'
                    }`}
                  >
                    {i * 50 + 1}-{Math.min((i + 1) * 50, (popular || []).length)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(popular || []).slice(catalogBatch * 50, (catalogBatch + 1) * 50).map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} onClick={() => onSelectAnime(anime.mal_id)} />
              ))}
            </div>
          </div>
        </>
      )}

      {!query && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5">
           <Search size={200} />
        </div>
      )}
    </div>
  );
}

interface AnimeCardProps {
  anime: Anime;
  onClick: () => void;
  key?: any;
}

function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const formatDuration = (durationStr: string, type?: string) => {
    if (!durationStr || durationStr === 'Unknown') return null;
    
    const isMovie = type?.toLowerCase().includes('movie') || 
                    type?.toLowerCase().includes('special') || 
                    durationStr.toLowerCase().includes('hr');
    
    const hrMatch = durationStr.match(/(\d+)\s*hr/i);
    const minMatch = durationStr.match(/(\d+)\s*min/i);
    const secMatch = durationStr.match(/(\d+)\s*sec/i);
    
    const h = hrMatch ? parseInt(hrMatch[1]) : 0;
    const m = minMatch ? parseInt(minMatch[1]) : 0;
    const s = secMatch ? parseInt(secMatch[1]) : 0;
    
    if (isMovie) {
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    } else {
      return `${m}m`;
    }
  };

  const duration = formatDuration(anime.duration, anime.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-obsidian-800 rounded-2xl overflow-hidden border border-white/5 group shadow-lg"
    >
      <div className="relative aspect-[2/3]">
        <img
          src={anime.images?.jpg?.large_image_url || undefined}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-indigo-500/90 backdrop-blur-md text-black font-black text-[10px] px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
          <Star size={10} fill="currentColor" />
          {anime.score || 'N/A'}
        </div>
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          {anime.episodes && (
            <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/10 w-fit uppercase tracking-tighter">
              {anime.episodes} episodes
            </div>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-white font-bold text-xs line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
          {anime.title_english || anime.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
           <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest">
             {anime.type || 'TV'}
           </p>
           <p className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${
             anime.status === 'Currently Airing' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
           }`}>
             {anime.status === 'Currently Airing' ? 'Airing' : 'Completed'}
           </p>
        </div>
      </div>
    </motion.div>
  );
}
