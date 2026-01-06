
import React, { useState } from 'react';
import { Wallpaper } from '../types';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onClick: (wp: Wallpaper) => void;
  onToggleFavorite: (id: string) => void;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({ wallpaper, onClick, onToggleFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const rotation = wallpaper.rotation || 0;
  const isRotatedSideways = rotation % 180 !== 0;
  
  const baseScale = isRotatedSideways ? 1.34 : 1.1;
  const hoverScale = isHovered ? 1.1 : 1;
  const finalScale = baseScale * hoverScale;

  const focalX = wallpaper.focalPoint?.x ?? 50;
  const focalY = wallpaper.focalPoint?.y ?? 50;

  return (
    <div 
      className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-3 hover:shadow-rose-400/30 border border-white/50"
      onClick={() => onClick(wallpaper)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 优雅的加载占位图 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 via-rose-100 to-pink-50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      )}

      <div className={`w-full h-full overflow-hidden flex items-center justify-center bg-rose-50 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <img 
          src={wallpaper.url} 
          alt={wallpaper.title}
          onLoad={() => setIsLoaded(true)}
          style={{ 
            transform: `rotate(${rotation}deg) scale(${finalScale})`,
            objectPosition: `${focalX}% ${focalY}%`
          }}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
        />
      </div>
      
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 via-rose-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
        <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
          <div className="flex items-center space-x-2 mb-2">
            {wallpaper.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[9px] font-black text-white uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-2xl font-black text-white mb-1 anime-font drop-shadow-lg">
            {wallpaper.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70 font-bold">
              @{wallpaper.author}
            </p>
            <div className="flex items-center space-x-3 text-white/50 text-[10px] font-mono">
               <span className="flex items-center space-x-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                 <span>{wallpaper.views || 0}</span>
               </span>
            </div>
          </div>
        </div>
      </div>

      <button 
        className={`absolute top-6 right-6 w-12 h-12 rounded-2xl glass-panel flex items-center justify-center transition-all duration-500 shadow-xl ${
          wallpaper.isFavorite ? 'text-rose-500 bg-white/80 scale-110' : 'text-white bg-black/20 hover:bg-white hover:text-rose-500'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(wallpaper.id);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={wallpaper.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={wallpaper.isFavorite ? "animate-[pulse_1s_infinite]" : ""}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </button>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default WallpaperCard;
