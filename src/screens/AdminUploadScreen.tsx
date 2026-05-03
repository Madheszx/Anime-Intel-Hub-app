import { Lock, Upload, ArrowLeft, Send, CheckCircle2, AlertCircle, LogIn, LogOut, Trash2, Video, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { SparkVideo, NewsItem } from '../types';

interface AdminUploadScreenProps {
  onBack: () => void;
}

export default function AdminUploadScreen({ onBack }: AdminUploadScreenProps) {
  const [pin, setPin] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Form State
  const [contentType, setContentType] = useState('Sparks Short Video');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState(9.0);
  const [sparkType, setSparkType] = useState('Genres Sparks');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Lists state
  const [sparks, setSparks] = useState<SparkVideo[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthorized || !user) return;

    // Listen to sparks
    const qSparks = query(collection(db, 'sparks'), orderBy('createdAt', 'desc'));
    const unsubSparks = onSnapshot(qSparks, (snapshot) => {
      setSparks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SparkVideo)));
    });

    // Listen to news
    const qNews = query(collection(db, 'news'), orderBy('date', 'desc'));
    const unsubNews = onSnapshot(qNews, (snapshot) => {
      setNews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubSparks();
      unsubNews();
    };
  }, [isAuthorized, user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Authentication failed");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handlePinSubmit = (val: string) => {
    if (val === '1234') { // Admin PIN
      setIsAuthorized(true);
      setError('');
    } else if (val.length === 4) {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleNumber = (n: string) => {
    if (pin.length < 4) {
      const newPin = pin + n;
      setPin(newPin);
      if (newPin.length === 4) handlePinSubmit(newPin);
    }
  };

  const handleUpload = async () => {
    if (!user) {
      setError('Please login to upload content');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('idle');
    setError('');

    try {
        if (contentType === 'Sparks Short Video') {
        if (!title || !url) throw new Error("Title and URL are required");
        await addDoc(collection(db, 'sparks'), {
          title,
          url,
          thumbnail: thumbnail || '', // Allow empty for auto-thumb
          genre: genre || 'Action',
          rating: Number(rating),
          type: sparkType,
          createdAt: new Date().toISOString()
        });
      } else if (contentType === 'Anime News Article') {
        if (!title || !thumbnail) throw new Error("Title and Image URL are required");
        await addDoc(collection(db, 'news'), {
          title,
          content: 'Full news content goes here...', 
          imageUrl: thumbnail,
          author: user.displayName || 'Admin',
          date: new Date().toISOString()
        });
      }
      
      setUploadStatus('success');
      // Reset form
      setTitle('');
      setUrl('');
      setThumbnail('');
      setGenre('');
      
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed. Check permissions.');
    } finally {
      setIsUploading(false);
    }
  };

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541560052-3744e4e98e44?auto=format&fit=crop&q=80&w=800';

  const handleDelete = async (coll: string, id: string) => {
    setDeletingId(id);
    setError('');
    
    try {
      await deleteDoc(doc(db, coll, id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Delete failed: " + (err instanceof Error ? err.message : 'Permission denied'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col">
       <header className="p-4 px-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Hub</h1>
          </div>
          {user && (
            <button onClick={handleLogout} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-red-400 flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
              <LogOut size={12} />
              Logout
            </button>
          )}
       </header>

       <AnimatePresence mode="wait">
          {!isAuthorized ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center px-6 min-h-[70vh]"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 shadow-xl border border-indigo-500/20">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Access Portal</h2>
              <p className="text-gray-500 text-sm mb-10 text-center">Enter your 4-digit administrator PIN.</p>

              <div className="flex gap-4 mb-12">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > i ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-gray-800'
                    }`}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs font-bold mb-6">{error}</p>}

              <div className="grid grid-cols-3 gap-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'clear'].map((btn, i) => (
                   btn === '' ? <div key={i} /> :
                   <button
                    key={i}
                    onClick={() => btn === 'clear' ? setPin('') : handleNumber(btn)}
                    className="w-16 h-16 rounded-2xl bg-obsidian-800 border border-white/5 text-xl font-black text-white flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-all shadow-sm"
                   >
                     {btn === 'clear' ? 'C' : btn}
                   </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-6 flex flex-col gap-6 pt-6 pb-12"
            >
               {!user ? (
                 <div className="bg-obsidian-800 rounded-2xl p-8 border border-white/5 flex flex-col items-center gap-6 text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <LogIn size={32} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Identity Verification</h3>
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed">System requires Google Authentication to verify deployment permissions.</p>
                    </div>
                    <button 
                      onClick={handleLogin}
                      className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Authenticate with Google
                    </button>
                 </div>
               ) : (
                 <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex justify-between items-center shadow-lg">
                    <div className="flex gap-4 items-center">
                      <img src={user.photoURL || undefined} alt="avatar" className="w-10 h-10 rounded-full border border-indigo-500/30" />
                      <div>
                        <h3 className="text-white font-bold text-sm">{user.displayName}</h3>
                        <p className="text-indigo-400/60 text-[10px] uppercase font-bold tracking-widest">Verified Admin</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 </div>
               )}

               {user && (
                 <div className="space-y-4 pb-12">
                   <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] px-1">Deploy New Content</h3>
                   
                   <div className="bg-obsidian-800 rounded-2xl p-6 border border-white/5 space-y-6 shadow-xl">
                      <div className="space-y-2">
                         <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none px-1">Structure</label>
                         <select 
                           value={contentType}
                           onChange={(e) => setContentType(e.target.value)}
                           className="w-full bg-obsidian-900 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                         >
                            <option>Sparks Short Video</option>
                            <option>Anime News Article</option>
                            <option>Database Entry (AnimeBase)</option>
                         </select>
                      </div>

                      <div className="space-y-2">
                         <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none px-1">MEGA Cloud Payload (Video URL)</label>
                         <input
                           type="text"
                           value={url}
                           onChange={(e) => setUrl(e.target.value)}
                           placeholder="https://mega.nz/file/... (20GB Cloud Link)"
                           className="w-full bg-obsidian-900 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono text-[11px]"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none px-1">Metadata Title</label>
                         <input
                           type="text"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           placeholder="Ex: Epic Transformation 4K"
                           className="w-full bg-obsidian-900 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                         />
                      </div>

                      {contentType === 'Sparks Short Video' && (
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none px-1">Tag</label>
                              <input
                                type="text"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                placeholder="Action"
                                className="w-full bg-obsidian-900 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none px-1">Category</label>
                              <select 
                                value={sparkType}
                                onChange={(e) => setSparkType(e.target.value)}
                                className="w-full bg-obsidian-900 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                              >
                                 <option>Genres Sparks</option>
                                 <option>Anime Updates</option>
                                 <option>Episodes Ratings</option>
                              </select>
                           </div>
                        </div>
                      )}

                      <div className="space-y-2">
                         <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest leading-none px-1">Thumbnail Preview URL</label>
                         <div className="relative group">
                           <input
                             type="text"
                             value={thumbnail}
                             onChange={(e) => setThumbnail(e.target.value)}
                             placeholder="Cover image url (MEGA/Imgur)..."
                             className="w-full bg-obsidian-900 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                           />
                           {thumbnail && (
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg pointer-events-none">
                               <img 
                                 src={thumbnail} 
                                 className="w-full h-full object-cover" 
                                 alt="preview" 
                                 referrerPolicy="no-referrer"
                                 onError={(e) => (e.target as HTMLImageElement).src = FALLBACK_IMAGE}
                               />
                             </div>
                           )}
                         </div>
                      </div>

                      {uploadStatus === 'success' && (
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                          <CheckCircle2 size={16} />
                          CONTENT DEPLOYED SUCCESSFULLY
                        </div>
                      )}

                      {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                          <AlertCircle size={16} />
                          {error}
                        </div>
                      )}

                      <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className={`w-full py-4 rounded-xl text-black font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                          isUploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20'
                        }`}
                      >
                         {isUploading ? (
                           <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                         ) : (
                           <>
                             <Upload size={20} />
                             PUSH TO PRODUCTION
                           </>
                         )}
                      </button>
                   </div>

                   {/* Management Section */}
                   <div className="space-y-4 pt-4">
                     <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] px-1">Manage Content</h3>
                     
                    <div className="space-y-3">
                        {sparks.map(spark => {
                          const isYouTube = spark.url && (spark.url.includes('youtube.com') || spark.url.includes('youtu.be'));
                          const isDirectVideo = spark.url && (spark.url.endsWith('.mp4') || spark.url.endsWith('.webm') || spark.url.endsWith('.mov'));
                          const videoId = isYouTube ? (spark.url.split('v=')[1]?.split('&')[0] || spark.url.split('/').pop()) : null;

                          return (
                            <div key={spark.id} className="bg-obsidian-800 p-3 rounded-2xl border border-white/5 flex items-center gap-4 group">
                                <div className="w-12 h-16 rounded-lg overflow-hidden bg-obsidian-900 shrink-0">
                                  {spark.thumbnail ? (
                                    <img 
                                      src={spark.thumbnail} 
                                      className="w-full h-full object-cover" 
                                      alt="" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                    />
                                  ) : isYouTube ? (
                                    <img 
                                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                                      className="w-full h-full object-cover" 
                                      alt="" 
                                    />
                                  ) : isDirectVideo ? (
                                    <video 
                                      src={`${spark.url}#t=0.1`} 
                                      className="w-full h-full object-cover" 
                                      muted 
                                      playsInline 
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img 
                                      src={FALLBACK_IMAGE} 
                                      className="w-full h-full object-cover opacity-50 grayscale" 
                                      alt="" 
                                    />
                                  )}
                               </div>
                               <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                   <Video size={10} className="text-indigo-400" />
                                   <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400/80">Spark Video</span>
                                </div>
                                <h4 className="text-white font-bold text-xs truncate">{spark.title}</h4>
                                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mt-0.5">{spark.genre} • {spark.type}</p>
                             </div>
                             <button 
                                onClick={() => handleDelete('sparks', spark.id)}
                                disabled={deletingId === spark.id}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                                  deletingId === spark.id 
                                    ? 'bg-gray-500/10 text-gray-500 animate-pulse' 
                                    : 'bg-red-500/10 text-red-500 opacity-60 hover:opacity-100 hover:bg-red-500 hover:text-white'
                                }`}
                                title="Delete Spark"
                             >
                                {deletingId === spark.id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                             </button>
                          </div>
                        );
                        })}

                        {news.map(n => (
                          <div key={n.id} className="bg-obsidian-800 p-3 rounded-2xl border border-white/5 flex items-center gap-4 group">
                             <div className="w-12 h-12 rounded-lg overflow-hidden bg-obsidian-900 shrink-0">
                                <img 
                                  src={n.imageUrl || FALLBACK_IMAGE} 
                                  className="w-full h-full object-cover" 
                                  alt="" 
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                  }}
                                />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                   <FileText size={10} className="text-pink-400" />
                                   <span className="text-[8px] font-black uppercase tracking-widest text-pink-400/80">Community News</span>
                                </div>
                                <h4 className="text-white font-bold text-xs truncate">{n.title}</h4>
                                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mt-0.5">By {n.author}</p>
                             </div>
                             <button 
                                onClick={() => handleDelete('news', n.id)}
                                disabled={deletingId === n.id}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                                  deletingId === n.id 
                                    ? 'bg-gray-500/10 text-gray-500 animate-pulse' 
                                    : 'bg-red-500/10 text-red-500 opacity-60 hover:opacity-100 hover:bg-red-500 hover:text-white'
                                }`}
                                title="Delete News"
                             >
                                {deletingId === n.id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                             </button>
                          </div>
                        ))}

                        {sparks.length === 0 && news.length === 0 && (
                          <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-40">
                             <Trash2 size={32} className="mb-4" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">No deployed content</p>
                          </div>
                        )}
                     </div>
                   </div>
                 </div>
               )}
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

