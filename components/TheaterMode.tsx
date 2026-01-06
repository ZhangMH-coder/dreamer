
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wallpaper } from '../types';

interface TheaterModeProps {
  isOpen: boolean;
  wallpapers: Wallpaper[];
  initialIndex: number;
  onClose: () => void;
}

const TheaterMode: React.FC<TheaterModeProps> = ({ isOpen, wallpapers, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<number | null>(null);
  const controlsTimerRef = useRef<number | null>(null);

  // 强制显示控制条的函数
  const wakeControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
      wakeControls();
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, initialIndex, wakeControls]);

  const nextWallpaper = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % wallpapers.length);
    wakeControls();
  }, [wallpapers.length, wakeControls]);

  const prevWallpaper = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + wallpapers.length) % wallpapers.length);
    wakeControls();
  }, [wallpapers.length, wakeControls]);

  // 自动播放逻辑
  useEffect(() => {
    if (isAutoPlay && isOpen) {
      timerRef.current = window.setInterval(nextWallpaper, 5000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isAutoPlay, isOpen, nextWallpaper]);

  // 键盘支持 - 强制支持 Esc 退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextWallpaper();
      if (e.key === 'ArrowLeft') prevWallpaper();
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextWallpaper, prevWallpaper, onClose]);

  if (!isOpen || wallpapers.length === 0) return null;

  const current = wallpapers[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black select-none overflow-hidden flex items-center justify-center cursor-none"
      onMouseMove={wakeControls}
      onClick={(e) => {
        // 点击最外层背景直接退出 (不包括图片区域)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 1. 动态氛围背景 */}
      <div className="absolute inset-0 opacity-40 scale-110 pointer-events-none z-0">
        <div 
          key={`bg-${current.id}`}
          className="absolute inset-0 bg-cover bg-center blur-[120px] transition-all duration-1000"
          style={{ backgroundImage: `url(${current.url})` }}
        ></div>
      </div>

      {/* 2. 主画面 - 增加 cursor-auto 确保图片上鼠标可见 */}
      <div 
        key={`img-container-${current.id}`}
        className="relative max-w-[95vw] max-h-[95vh] shadow-[0_0_120px_rgba(0,0,0,1)] rounded-sm overflow-hidden animate-theater-in z-10 pointer-events-none cursor-auto"
      >
        <img 
          src={current.url} 
          alt={current.title}
          className="w-full h-full object-contain animate-ken-burns pointer-events-auto"
          style={{ 
            transform: `rotate(${current.rotation || 0}deg)`,
            objectPosition: `${current.focalPoint?.x ?? 50}% ${current.focalPoint?.y ?? 50}%` 
          }}
        />
      </div>

      {/* 3. 独立且最高优先级的关闭按钮 (右上角) */}
      <div 
        className={`absolute top-10 right-10 z-[999] transition-all duration-500 ${
          showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
        }`}
      >
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }} 
          className="flex items-center space-x-3 group bg-black/40 hover:bg-red-600/40 backdrop-blur-xl border border-white/20 hover:border-red-500/50 p-2 pr-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl pointer-events-auto cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </div>
          <span className="text-white font-black text-sm tracking-[0.2em] uppercase">Close</span>
        </button>
      </div>

      {/* 4. 标题 HUD */}
      <div 
        className={`absolute top-10 left-10 p-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] transition-all duration-500 z-50 shadow-2xl ${
          showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'
        }`}
      >
        <h2 className="text-2xl font-black text-white anime-font drop-shadow-lg leading-none">{current.title}</h2>
        <p className="text-pink-300 font-bold text-[10px] tracking-[0.3em] uppercase opacity-80 mt-2">@{current.author} · {currentIndex + 1} / {wallpapers.length}</p>
      </div>

      {/* 5. 侧边导航 */}
      <div className={`absolute inset-y-0 left-0 w-48 flex items-center justify-start pl-8 transition-opacity duration-500 z-50 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); prevWallpaper(); }} className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all hover:scale-110 active:scale-90 border border-white/5 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      <div className={`absolute inset-y-0 right-0 w-48 flex items-center justify-end pr-8 transition-opacity duration-500 z-50 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); nextWallpaper(); }} className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all hover:scale-110 active:scale-90 border border-white/5 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* 6. 底部中央控制器 */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 glass-panel px-10 py-5 rounded-full flex items-center space-x-8 transition-all duration-700 z-50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] ${
        showControls ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'
      }`}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsAutoPlay(!isAutoPlay); }} 
          className={`flex items-center space-x-3 font-black text-[10px] tracking-[0.2em] transition-colors cursor-pointer ${isAutoPlay ? 'text-pink-400' : 'text-white/50 hover:text-white'}`}
        >
          {isAutoPlay ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
          <span>{isAutoPlay ? 'AUTO CRUISING' : 'START TOUR'}</span>
        </button>
        
        <div className="h-6 w-[1px] bg-white/10"></div>
        
        <div className="flex space-x-6 text-white/30">
          <button onClick={(e) => e.stopPropagation()} className="hover:text-pink-400 transition-colors cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
      </div>

      {/* 7. 进度条 */}
      {isAutoPlay && (
        <div className="absolute bottom-0 left-0 h-1.5 bg-pink-500/20 w-full overflow-hidden z-[60] pointer-events-none">
          <div key={`progress-${currentIndex}`} className="h-full bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 animate-progress shadow-[0_0_20px_rgba(236,72,153,0.8)]"></div>
        </div>
      )}

      {/* 自定义鼠标提示（当鼠标静止隐藏控制条时，给个提示感） */}
      <div className={`fixed w-8 h-8 rounded-full border border-white/30 transition-opacity duration-500 pointer-events-none z-[1000] ${showControls ? 'opacity-0' : 'opacity-20'}`} style={{ left: '-100px', top: '-100px' }}></div>

      <style>{`
        @keyframes theater-in {
          0% { opacity: 0; transform: scale(1.05); filter: blur(20px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-theater-in { animation: theater-in 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-ken-burns { animation: ken-burns 20s ease-in-out infinite alternate; }
        .animate-progress { animation: progress-fill 5s linear forwards; }
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default TheaterMode;
