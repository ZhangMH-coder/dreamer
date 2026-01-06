
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import WallpaperCard from './components/WallpaperCard';
import UploadModal from './components/UploadModal';
import WallpaperDetail from './components/WallpaperDetail';
import TheaterMode from './components/TheaterMode';
import SakuraEffect from './components/SakuraEffect';
import { Wallpaper, AppTab } from './types';
import { INITIAL_WALLPAPERS } from './constants';

const LOCAL_STORAGE_KEY = 'mugen_gallery_wallpapers';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DISCOVER);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_WALLPAPERS;
      }
    }
    return INITIAL_WALLPAPERS;
  });
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [theaterStartIndex, setTheaterStartIndex] = useState(0);

  // 数据持久化
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wallpapers));
  }, [wallpapers]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    wallpapers.forEach(wp => wp.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [wallpapers]);

  useEffect(() => {
    if (selectedWallpaper) {
      const updated = wallpapers.find(w => w.id === selectedWallpaper.id);
      if (updated) {
        setSelectedWallpaper(updated);
      } else {
        setSelectedWallpaper(null);
      }
    }
  }, [wallpapers, selectedWallpaper]);

  const toggleFavorite = (id: string) => {
    setWallpapers(prev => prev.map(wp => 
      wp.id === id ? { ...wp, isFavorite: !wp.isFavorite } : wp
    ));
  };

  const updateRotation = (id: string, newRotation: number) => {
    setWallpapers(prev => prev.map(wp => 
      wp.id === id ? { ...wp, rotation: newRotation } : wp
    ));
  };

  const updateFocalPoint = (id: string, point: { x: number; y: number }) => {
    setWallpapers(prev => prev.map(wp => 
      wp.id === id ? { ...wp, focalPoint: point } : wp
    ));
  };

  const deleteWallpaper = (id: string) => {
    setWallpapers(prev => prev.filter(wp => wp.id !== id));
  };

  const openTheaterAt = (wallpaperId: string) => {
    const index = filteredWallpapers.findIndex(w => w.id === wallpaperId);
    setTheaterStartIndex(index >= 0 ? index : 0);
    setIsTheaterOpen(true);
  };

  const handleBatchUpload = (items: { title: string; author: string; url: string; tags: string[] }[]) => {
    const newWallpapers: Wallpaper[] = items.map((item, index) => ({
      id: (Date.now() + index).toString(),
      title: item.title,
      author: item.author,
      url: item.url,
      tags: item.tags,
      isFavorite: true,
      rotation: 0,
      focalPoint: { x: 50, y: 50 },
      views: Math.floor(Math.random() * 100)
    }));
    
    setWallpapers(prev => [...newWallpapers, ...prev]);
    if (newWallpapers.length > 0) {
      setActiveTab(AppTab.GALLERY);
    }
  };

  const filteredWallpapers = useMemo(() => {
    let result = activeTab === AppTab.GALLERY 
      ? wallpapers.filter(w => w.isFavorite) 
      : wallpapers;

    // 搜索过滤
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(wp => 
        wp.title.toLowerCase().includes(q) || 
        wp.author.toLowerCase().includes(q) ||
        wp.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      result = result.filter(wp => 
        selectedTags.some(tag => wp.tags.includes(tag))
      );
    }
    return result;
  }, [activeTab, wallpapers, selectedTags, searchQuery]);

  const handleSelectWallpaper = (wp: Wallpaper) => {
    // 模拟视图增加
    setWallpapers(prev => prev.map(w => 
      w.id === wp.id ? { ...w, views: (w.views || 0) + 1 } : w
    ));
    setSelectedWallpaper(wp);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="anime-bg"></div>
      <div className="anime-overlay"></div>
      <div className="anime-glow"></div>
      <SakuraEffect />

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        allTags={allTags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {activeTab === AppTab.DISCOVER && !searchQuery && (
        <section className="pt-32 pb-12 px-6 relative z-10">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <div className="inline-block px-5 py-2 glass-panel rounded-full text-[11px] font-black text-rose-600 uppercase tracking-[0.3em] mb-4 border-rose-200/50 bg-white/40 shadow-xl">
              ✨ Welcome to Sakura Dreamscape ✨
            </div>
            <h1 className="text-6xl md:text-8xl font-black anime-font tracking-tighter drop-shadow-[0_10px_15px_rgba(251,113,133,0.3)] text-rose-600">
              幻梦图库 <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600 animate-pulse">樱色次元</span>
            </h1>
            <p className="max-w-2xl mx-auto text-rose-900/70 text-xl leading-relaxed font-bold tracking-tight">
              在粉色的呼吸中，寻找属于你的那份悸动。
            </p>
            <div className="pt-4">
              <button 
                onClick={() => setIsTheaterOpen(true)}
                className="px-12 py-4 bg-white/60 hover:bg-rose-500 hover:text-white border border-rose-200 rounded-full text-rose-600 font-black tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-md"
              >
                开启沉浸巡航
              </button>
            </div>
          </div>
        </section>
      )}

      <main className={`max-w-7xl mx-auto px-6 relative z-10 ${activeTab === AppTab.DISCOVER && !searchQuery ? 'pt-4' : 'pt-32'}`}>
        {filteredWallpapers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredWallpapers.map((wp, index) => (
              <div 
                key={wp.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <WallpaperCard 
                  wallpaper={wp} 
                  onClick={handleSelectWallpaper}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-32 h-32 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
            </div>
            <h3 className="text-3xl font-black text-rose-900/40 anime-font">次元索引中未找到该记录</h3>
            <p className="text-rose-900/20 font-bold tracking-widest uppercase text-xs">尝试切换标签或清理搜索关键词</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTags([]); }}
              className="px-8 py-3 bg-rose-100 text-rose-500 rounded-full text-xs font-black tracking-widest uppercase hover:bg-rose-200 transition-colors"
            >
              重置次元链路
            </button>
          </div>
        )}
      </main>

      <button 
        className="fixed bottom-10 right-10 w-18 h-18 bg-gradient-to-tr from-rose-400 via-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(244,63,94,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 z-50 group overflow-hidden border-2 border-white"
        onClick={() => setIsUploadOpen(true)}
      >
        <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white relative z-10"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
      </button>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleBatchUpload}
        existingTags={allTags}
      />

      <WallpaperDetail 
        wallpaper={selectedWallpaper} 
        onClose={() => setSelectedWallpaper(null)} 
        onToggleFavorite={toggleFavorite}
        onUpdateRotation={updateRotation}
        onUpdateFocalPoint={updateFocalPoint}
        onDelete={deleteWallpaper}
        onOpenTheater={() => {
          if (selectedWallpaper) {
            openTheaterAt(selectedWallpaper.id);
            setSelectedWallpaper(null);
          }
        }}
      />

      <TheaterMode 
        isOpen={isTheaterOpen}
        wallpapers={filteredWallpapers}
        initialIndex={theaterStartIndex}
        onClose={() => setIsTheaterOpen(false)}
      />
    </div>
  );
};

export default App;
