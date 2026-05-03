import { Search, Play, X, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { SparkVideo } from '../types';

export default function SparksScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<SparkVideo | null>(null);
  const [sparks, setSparks] = useState<SparkVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Genres Sparks', 'Anime Updates', 'Episodes Ratings'];

  useEffect(() => {
    const q = query(collection(db, 'sparks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SparkVideo[];
      setSparks(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSparks = sparks.filter(spark => {
    const sparkType = (spark as any).type || 'Genres Sparks';
    const matchesFilter = activeFilter === 'All' || sparkType === activeFilter;
    const matchesSearch = spark.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541560052-3744e4e98e44?auto=format&fit=crop&q=80&w=800';

  const SparkThumbnail = ({ spark }: { spark: SparkVideo }) => {
    const isYouTube = spark.url && (spark.url.includes('youtube.com') || spark.url.includes('youtu.be'));
    const isDirectVideo = spark.url && (spark.url.endsWith('.mp4') || spark.url.endsWith('.webm') || spark.url.endsWith('.mov'));
    
    if (spark.thumbnail) {
      return (
        <img
          src={spark.thumbnail}
          alt={spark.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
      );
    }

    if (isYouTube) {
      const videoId = spark.url.split('v=')[1]?.split('&')[0] || spark.url.split('/').pop();
      return (
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={spark.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      );
    }

    if (isDirectVideo) {
      return (
        <video
          src={`${spark.url}#t=0.1`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          muted
          playsInline
          preload="metadata"
        />
      );
    }

    return (
      <img
        src={FALLBACK_IMAGE}
        alt={spark.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50 grayscale"
      />
    );
  };

  return (
    <div className="pb-24 pt-6">
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <Star size={24} className="text-indigo-400 fill-indigo-400" />
          Sparks
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search sparks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian-800 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/20'
                  : 'bg-obsidian-800 text-gray-500 border border-white/5 hover:border-indigo-500/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <Loader2 className="animate-spin text-indigo-500" size={32} />
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Waking up database...</p>
        </div>
      ) : sparks.length === 0 ? (
        <div className="px-6 text-center py-20 flex flex-col items-center gap-4">
           <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-600">
             <Star size={32} />
           </div>
           <div>
             <h3 className="text-white font-bold">No Sparks Found</h3>
             <p className="text-gray-500 text-xs mt-2">Go to Admin Hub to upload your first spark!</p>
           </div>
        </div>
      ) : (
        <div className="px-6 grid grid-cols-2 gap-4">
          {filteredSparks.map((spark) => (
            <motion.div
              key={spark.id}
              layoutId={`spark-${spark.id}`}
              onClick={() => setSelectedVideo(spark)}
              className="group relative cursor-pointer"
            >
              <div className="aspect-[9/16] rounded-2xl overflow-hidden relative border border-white/5 bg-obsidian-800">
                <SparkThumbnail spark={spark} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                
                {/* Play Icon Top Right */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-500/80 backdrop-blur-md flex items-center justify-center text-black">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>

                {/* Rating Bottom Left */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1 items-start">
                  <div className="bg-indigo-400 text-black px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 shadow-xl">
                    <Star size={10} fill="currentColor" />
                    {spark.rating}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-white font-bold text-xs line-clamp-1 leading-tight group-hover:text-indigo-400 transition-colors">{spark.title}</h3>
                <p className="text-gray-500 text-[10px] mt-0.5 font-medium uppercase tracking-wider">{spark.genre}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col pt-4 overflow-hidden"
            style={{ bottom: '0px' }} // Full screen over nav
          >
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
              <h4 className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                {selectedVideo.title}
              </h4>
            </div>

            <div className="flex-1 w-full h-full relative">
              <div className="w-full h-full bg-obsidian-900 flex items-center justify-center relative">
                {selectedVideo.url && (selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be')) ? (
                   <iframe 
                    src={`https://www.youtube.com/embed/${selectedVideo.url.split('v=')[1]?.split('&')[0] || selectedVideo.url.split('/').pop()}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                   />
                ) : selectedVideo.url && selectedVideo.url.includes('mega.nz') ? (
                  <iframe 
                    src={selectedVideo.url.replace('/file/', '/embed/')}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                ) : selectedVideo.url ? (
                  <video 
                    src={selectedVideo.url || undefined}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    onError={(e) => {
                      console.error("Video play error", e);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-500">
                    <X size={40} />
                    <p className="text-xs font-bold uppercase tracking-widest">Invalid Stream URL</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="absolute right-6 bottom-20 flex flex-col gap-6 items-center">
              <div className="flex flex-col items-center gap-1">
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <Star size={24} className="fill-indigo-400 text-indigo-400" />
                </button>
                <span className="text-[10px] text-white font-bold">{selectedVideo.rating}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

