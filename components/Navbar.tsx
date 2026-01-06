
import React, { useState, useRef, useEffect } from 'react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  allTags, 
  selectedTags, 
  onTagsChange,
  searchQuery,
  onSearchChange
}) => {
  const tabs = Object.values(AppTab);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 背景音乐初始化
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // 监听 PWA 安装事件
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      audioRef.current?.pause();
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("请在浏览器菜单中选择“添加到主屏幕”以安装应用 ✨");
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-3xl px-8 py-4 shadow-[0_15px_40px_rgba(251,113,133,0.1)] border-rose-200/50 bg-white/60">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div 
              className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 transform hover:rotate-12 transition-transform cursor-pointer" 
              onClick={() => setActiveTab(AppTab.DISCOVER)}
            >
              <span className="text-white text-2xl font-bold anime-font">幻</span>
            </div>
            {/* 安装 App 引导小气泡 */}
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white"
                title="安装到桌面"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </button>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-rose-600 hidden lg:block">
            Mugen Gallery
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-grow justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 relative group ${
                activeTab === tab 
                ? 'text-rose-600 bg-rose-50' 
                : 'text-rose-900/40 hover:text-rose-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleMusic}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-rose-100 text-rose-400 hover:bg-rose-200'}`}
            title={isPlaying ? "暂停次元波动" : "开启幻梦旋律"}
          >
            {isPlaying ? (
              <div className="flex items-end space-x-0.5 h-4">
                <div className="w-0.5 bg-white animate-[music_0.8s_infinite] h-full"></div>
                <div className="w-0.5 bg-white animate-[music_1.2s_infinite] h-2/3"></div>
                <div className="w-0.5 bg-white animate-[music_1.0s_infinite] h-full"></div>
                <div className="w-0.5 bg-white animate-[music_0.9s_infinite] h-1/2"></div>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            )}
          </button>

          <div className={`relative hidden md:flex items-center transition-all duration-500 ${isSearchFocused ? 'w-56' : 'w-32'}`}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="搜索次元..."
              className={`w-full bg-rose-50/50 border border-rose-100 rounded-2xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/30 transition-all ${isSearchFocused ? 'shadow-[0_0_20px_rgba(251,113,133,0.2)]' : ''}`}
            />
            <div className="absolute left-3.5 text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
                selectedTags.length > 0 ? 'bg-rose-500 text-white shadow-lg' : 'text-rose-900/40 hover:text-rose-600 hover:bg-rose-50 border border-transparent'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <span className="hidden sm:inline">筛选</span>
            </button>

            {isTagsOpen && (
              <div className="absolute top-full mt-4 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_30px_70px_rgba(251,113,133,0.3)] border border-rose-100 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[12px] text-rose-900/30 uppercase tracking-[0.3em] font-black">次元索引</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2">
                    {allTags.map(tag => (
                      <label 
                        key={tag}
                        className={`flex items-center space-x-3 p-4 rounded-2xl transition-all cursor-pointer ${
                          selectedTags.includes(tag) 
                          ? 'bg-rose-500/10 border-rose-500/20' 
                          : 'hover:bg-rose-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                          selectedTags.includes(tag) 
                          ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-500/30' 
                          : 'border-rose-100'
                        }`}>
                          {selectedTags.includes(tag) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                        <input type="checkbox" className="hidden" checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)}/>
                        <span className={`text-sm font-bold ${selectedTags.includes(tag) ? 'text-rose-600' : 'text-rose-900/60'}`}>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes music {
          0%, 100% { height: 10%; }
          50% { height: 100%; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
