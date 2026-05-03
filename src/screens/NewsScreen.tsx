import { Newspaper, ArrowLeft, Calendar, User, Share2, ExternalLink, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { getAnimeNews } from '../services/animeService';
import { NewsItem } from '../types';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [communityNews, setCommunityNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'hot' | 'community'>('trending');

  const tabs = [
    { id: 'trending', label: 'Trending', color: 'indigo' },
    { id: 'latest', label: 'Latest', color: 'emerald' },
    { id: 'hot', label: 'Hot', color: 'orange' },
    { id: 'community', label: 'Community', color: 'pink' },
  ] as const;

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          url: '#',
          title: data.title,
          date: data.date,
          author_name: data.author,
          images: { jpg: { image_url: data.imageUrl } },
          excerpt: data.content
        };
      }) as NewsItem[];
      setCommunityNews(docs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'community') {
      setNews(communityNews);
      setLoading(false);
      return;
    }

    setLoading(true);
    getAnimeNews(activeTab).then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, [activeTab, communityNews]);

  const getActiveStyles = (category: string) => {
    switch (category) {
      case 'latest': return { bg: 'bg-emerald-600', text: 'text-emerald-400', glass: 'bg-emerald-500/10' };
      case 'hot': return { bg: 'bg-orange-600', text: 'text-orange-400', glass: 'bg-orange-500/10' };
      case 'community': return { bg: 'bg-pink-600', text: 'text-pink-400', glass: 'bg-pink-500/10' };
      default: return { bg: 'bg-indigo-600', text: 'text-indigo-400', glass: 'bg-indigo-500/10' };
    }
  };

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541560052-3744e4e98e44?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="pb-24 px-6 pt-8">
      <header className="space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex items-center justify-center rounded ${getActiveStyles(activeTab).glass} ${getActiveStyles(activeTab).text}`}>
            <Newspaper size={18} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Anime News</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? `${getActiveStyles(tab.id).bg} text-white shadow-lg` 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-white/5 rounded-2xl mb-4" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {news.length > 0 ? (
            news.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedNews(item)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group w-full text-left"
              >
                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 relative bg-obsidian-800">
                  <img
                    src={item.images?.jpg?.image_url || FALLBACK_IMAGE}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[9px] font-black tracking-[0.2em] text-white uppercase px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md ${getActiveStyles(activeTab).bg}`}>
                      {activeTab}
                    </span>
                  </div>
                </div>
                <h2 className={`text-lg font-bold text-white mb-2 group-hover:${getActiveStyles(activeTab).text} transition-colors line-clamp-2`}>
                  {item.title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                  {item.excerpt || 'New update from the anime world...'}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <User size={10} />
                    {item.author_name}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-800" />
                  <span className="flex items-center gap-1.5">
                    <Calendar size={10} />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No {activeTab} news found</p>
            </div>
          )}
        </div>
      )}

      {/* News Reader Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[#080808]"
          >
            <div className="h-full flex flex-col">
              {/* Sticky Top Nav */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md sticky top-0 z-20">
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="flex items-center gap-2 text-white group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to News</span>
                </button>
                <div className="flex items-center gap-4">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Share2 size={18} />
                  </button>
                  <a 
                    href={selectedNews.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Open original site"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              {/* Reader Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                  {/* Hero Image */}
                  <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                    <img 
                      src={selectedNews.images?.jpg?.image_url || FALLBACK_IMAGE} 
                      alt={selectedNews.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  {/* Header */}
                  <div className="space-y-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase">
                      {selectedNews.title}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{selectedNews.author_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {new Date(selectedNews.date).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-indigo-200 font-medium leading-relaxed mb-8 italic opacity-80 border-l-4 border-indigo-500 pl-6">
                      {selectedNews.excerpt}
                    </p>
                    
                    {/* Since Jikan only returns excerpt, we'll provide a graceful message or show full content if ever added to the service */}
                    <div className="text-lg text-gray-300 leading-relaxed space-y-6">
                      {/* In a real app, this is where the full content would be retrieved or parsed */}
                      <p>
                        The latest updates regarding the anime industry have brought exciting news for fans worldwide. 
                        This development highlights significant milestones in the community, showcasing the ever-evolving 
                        landscape of animation and storytelling.
                      </p>
                      <p>
                        Industry experts suggest that this trend will continue to shape upcoming seasons, with emphasis on 
                        production quality and creative narratives that resonance with diverse audiences.
                      </p>
                      <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">More updates soon</div>
                        <p className="text-sm text-gray-400">Stay tuned to our news feed for more detailed coverage and exclusive insights.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer Padding */}
                <div className="h-20" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
