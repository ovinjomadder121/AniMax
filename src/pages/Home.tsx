import { useState, useEffect, useRef } from 'react';
import { db, collection, query, orderBy, onSnapshot, updateDoc, doc, increment } from '../lib/firebase';
import { Photo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Search, X, TrendingUp, ImageIcon, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  'Naruto', 'One Piece', 'Attack on Titan', 'Dragon Ball', 
  'Demon Slayer', 'Jujutsu Kaisen', 'Solo Leveling', 
  'Death Note', 'Bleach', 'My Hero Academia'
];

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoList);
      setLoading(false);
    }, (error) => {
      console.error("Fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePhotoClick = async (photo: Photo) => {
    setSelectedPhoto(photo);
    try {
      const photoRef = doc(db, 'photos', photo.id);
      await updateDoc(photoRef, {
        views: increment(1)
      });
    } catch (err) {
      console.error("Failed to increment views", err);
    }
  };

  const downloadImage = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'animax-photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      window.open(url, '_blank');
    }
  };

  const filteredPhotos = photos.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) || 
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const trendingPhotos = [...photos]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Background with Pro-level Ultra-Smooth Blending */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {/* Layered masks for seamless integration */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Base darkening overlay - adjusted for better visibility */}
          <div className="absolute inset-0 bg-[#050505]/30" />
          
          {/* Multi-layered smooth blending gradients */}
          <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-[#050505] via-[#050505]/40 to-transparent" />
          
          {/* Soft vignettes for sides */}
          <div className="absolute inset-y-0 left-0 w-[20vw] bg-gradient-to-r from-[#050505] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[20vw] bg-gradient-to-l from-[#050505] to-transparent" />
          
          {/* Deep corner shadows for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050505_100%)] opacity-60" />
        </div>
        
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          src="https://images3.alphacoders.com/605/605728.jpg" 
          alt="Anime All Stars Mashup"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

        <div className="relative z-20 text-center px-6 max-w-4xl w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-8xl font-display font-bold mb-8 md:mb-12 tracking-tighter"
          >
            Explore With AniMax
          </motion.h2>

          {/* Search Bar */}
          <div ref={searchRef} className="relative max-w-2xl mx-auto group">
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/30 transition-all shadow-2xl">
              <div className="pl-4 md:pl-6 text-white/40">
                <Search size={18} className="md:w-5 md:h-5" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 0) setShowSuggestions(false);
                  else setShowSuggestions(true);
                }}
                onFocus={() => !searchQuery && setShowSuggestions(true)}
                className="w-full bg-transparent px-3 md:px-4 py-4 md:py-5 focus:outline-none placeholder:text-white/20 text-base md:text-lg"
                placeholder="Search anime, characters, or tags..."
              />
              {searchQuery && (
                <div className="flex items-center gap-1 md:gap-2 pr-3 md:pr-4">
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 md:p-2 text-white/20 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <X size={18} className="md:w-5 md:h-5" />
                  </button>
                  <button 
                    className="bg-white text-black p-1.5 md:p-2 rounded-lg md:rounded-xl hover:scale-105 transition-transform"
                    title="Press Enter to search"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Search size={16} className="md:w-[18px] md:h-[18px]" />
                    </motion.div>
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && !searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Popular searches</span>
                    <button onClick={() => setShowSuggestions(false)} className="text-white/20 hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {SUGGESTIONS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          setShowSuggestions(false);
                        }}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 hover:bg-white text-white/60 hover:text-black rounded-lg text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-12 max-w-7xl mx-auto -mt-12 md:-mt-20 relative z-30 space-y-12 md:space-y-16">
        
        {/* Trending Section */}
        {photos.length > 0 && !searchQuery && (
          <section>
            <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60">
                <TrendingUp size={16} className="md:w-5 md:h-5" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-medium">Top Wallpapers</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {trendingPhotos.map((photo) => (
                <motion.div
                  key={`trend-${photo.id}`}
                  whileHover={{ y: -8 }}
                  className="relative aspect-video rounded-xl overflow-hidden border border-white/5 cursor-pointer group"
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="text-white/40" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        <section>
          {!searchQuery && (
            <div className="flex items-center mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-display font-medium">Trending Now</h3>
            </div>
          )}

          {filteredPhotos.length === 0 ? (
            <div className="py-12 md:py-20 text-center border border-dashed border-white/10 rounded-2xl md:rounded-3xl">
              <p className="text-white/20 italic text-sm md:text-base">No wallpapers match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 border border-white/5 cursor-pointer"
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium truncate">{photo.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Modal / Details */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white/60 hover:text-white transition-all hover:rotate-90"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={24} />
            </button>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl max-h-full overflow-hidden flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5"
              />
              <div className="mt-6 md:mt-8 text-center w-full">
                <h2 className="text-2xl md:text-3xl font-display font-medium mb-2 md:mb-3">{selectedPhoto.title}</h2>
                {selectedPhoto.tags && (
                  <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-6">
                    {selectedPhoto.tags.map(t => (
                      <span key={t} className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.2em] border border-white/5 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => downloadImage(selectedPhoto.url, selectedPhoto.title)}
                  className="px-8 md:px-12 py-3.5 md:py-4 bg-white text-black rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:bg-white/90 transition-all flex items-center gap-2 md:gap-3 mx-auto shadow-xl"
                >
                  <Download size={18} className="md:w-5 md:h-5" />
                  Download 4K Quality
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
