
import React, { useEffect, useState, useRef } from 'react';
import { Wallpaper } from '../types';

interface WallpaperDetailProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateRotation: (id: string, rotation: number) => void;
  onUpdateFocalPoint: (id: string, point: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
  onOpenTheater: () => void;
}

const WallpaperDetail: React.FC<WallpaperDetailProps> = ({ 
  wallpaper, 
  onClose, 
  onToggleFavorite, 
  onUpdateRotation, 
  onUpdateFocalPoint,
  onDelete,
  onOpenTheater
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [tempFocal, setTempFocal] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (wallpaper) {
      document.body.style.overflow = 'hidden';
      setTempFocal(wallpaper.focalPoint || { x: 50, y: 50 });
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { 
      document.body.style.overflow = 'auto'; 
      setConfirmDelete(false);
    };
  }, [wallpaper]);

  if (!wallpaper) return null;

  const currentRotation = wallpaper.rotation || 0;
  const isRotatedSideways = currentRotation % 180 !== 0;
  const bgScale = isRotatedSideways ? 1.8 : 1.1;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const finalX = Math.max(0, Math.min(100, x));
    const finalY = Math.max(0, Math.min(100, y));
    const newPoint = { x: finalX, y: finalY };
    setTempFocal(newPoint);
    onUpdateFocalPoint(wallpaper.id, newPoint);
    showToast('预览焦点已锁定');
  };

  const handleRotate = () => {
    const newRotation = (currentRotation + 90) % 360;
    onUpdateRotation(wallpaper.id, newRotation);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    showToast('正在同步次元协议...');
    setTimeout(async () => {
      try {
        const response = await fetch(wallpaper.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${wallpaper.title}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        showToast('作品已归档至本地');
      } catch (error) {
        showToast('下载失败');
      } finally {
        setIsDownloading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-2 lg:p-4">
      {/* 动态模糊背景层 */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl overflow-hidden" onClick={onClose}>
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundImage: `url(${wallpaper.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `rotate(${currentRotation}deg) scale(${bgScale * 1.5}) blur(80px)`
          }}
        ></div>
        {/* 动态扫描线 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
      </div>
      
      <div className="relative w-full h-full max-w-none flex flex-col md:flex-row shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 animate-in zoom-in-95 duration-500 overflow-hidden md:rounded-2xl lg:rounded-3xl">
        
        {/* 流光边框装饰 */}
        <div className="absolute inset-0 pointer-events-none z-[60] border border-white/5 md:rounded-2xl lg:rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent animate-[pan_3s_linear_infinite]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-[pan_3s_linear_infinite_reverse]"></div>
        </div>

        {/* HUD 角标装饰 - 左上 */}
        <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-pink-500/30 rounded-tl-3xl z-20 pointer-events-none"></div>
        {/* HUD 角标装饰 - 右下 */}
        <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-violet-500/30 rounded-br-3xl z-20 pointer-events-none"></div>

        {/* 左侧：主预览区（全屏感核心） */}
        <div className="flex-grow bg-[#020617]/20 flex items-center justify-center relative group overflow-hidden cursor-crosshair">
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12" onClick={handleImageClick}>
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              {/* 图片背景柔光 */}
              <div className="absolute -inset-20 bg-pink-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <img 
                ref={imgRef}
                src={wallpaper.url} 
                alt={wallpaper.title}
                style={{ transform: `rotate(${currentRotation}deg)` }}
                className="max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none relative z-10"
              />
              
              {/* 增强版焦点准星 */}
              <div 
                className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) z-20"
                style={{ left: `${tempFocal.x}%`, top: `${tempFocal.y}%` }}
              >
                <div className="absolute inset-0 border border-pink-500/40 rounded-full animate-[spin_6s_linear_infinite]"></div>
                <div className="absolute inset-[20%] border border-white/10 rounded-xl animate-[pulse_2s_ease-in-out_infinite]"></div>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/60 to-transparent"></div>
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-pink-500/60 to-transparent"></div>
                <div className="absolute inset-[46%] bg-pink-500 rounded-full shadow-[0_0_25px_#ec4899] z-30"></div>
                {/* 坐标数据展示 */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono text-pink-400 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-pink-500/20 tracking-tighter shadow-xl">
                  LOC_DATA: [{tempFocal.x.toFixed(2)}, {tempFocal.y.toFixed(2)}]
                </div>
              </div>
            </div>
          </div>
          
          {/* 左侧操作浮筒 */}
          <div className="absolute bottom-10 left-10 flex space-x-4 z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); handleRotate(); }}
              className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-white/50 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all active:scale-90 group/rotate shadow-xl"
              title="旋转视角"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/rotate:rotate-180 transition-transform duration-700">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenTheater(); }}
              className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-white/50 hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all active:scale-90 shadow-xl"
              title="进入剧场模式"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20v14H2z"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            </button>
          </div>

          <button onClick={onClose} className="absolute top-10 right-10 w-14 h-14 rounded-full glass-panel flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all z-20 group shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* 右侧：信息与控制面板（侧边栏感） */}
        <div className="w-full md:w-[24rem] lg:w-[26rem] p-8 lg:p-10 flex flex-col justify-between bg-slate-950/90 backdrop-blur-2xl relative z-10 border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2 flex-grow">
            <div className="animate-in slide-in-from-right-10 duration-500 delay-150">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_12px_#ec4899]"></div>
                <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] font-mono">Archive.system // 0x{wallpaper.id}</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-black mb-6 anime-font tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/30 leading-[1.1]">
                {wallpaper.title}
              </h2>
              
              <div className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/20 transition-all mb-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 blur-2xl rounded-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-700 flex items-center justify-center text-lg text-white font-black shadow-lg transform group-hover:rotate-6 transition-transform">
                      {wallpaper.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-0.5">Contributor</div>
                      <div className="font-black text-white group-hover:text-pink-400 transition-colors">@{wallpaper.author}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {wallpaper.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold text-white/50 uppercase tracking-widest hover:border-pink-500/40 hover:text-white hover:bg-pink-500/10 transition-all cursor-default select-none">
                    # {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-10 duration-500 delay-200">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 group hover:bg-black/60 transition-colors">
                <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-2 group-hover:text-pink-500/50 transition-colors font-mono">Resolution</div>
                <div className="text-base font-mono text-white/70">3840 x 2160 <span className="text-[10px] text-pink-500/40">UHD</span></div>
              </div>
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 group hover:bg-black/60 transition-colors">
                <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-2 group-hover:text-violet-500/50 transition-colors font-mono">Sync_Size</div>
                <div className="text-base font-mono text-white/70">4.18 <span className="text-[10px]">MB</span></div>
              </div>
            </div>

            {/* 实时动态预览小窗 */}
            <div className="space-y-4 pt-6 animate-in slide-in-from-right-10 duration-500 delay-300">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-3 bg-pink-500 rounded-full"></div>
                  <label className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Crop_Engine Preview</label>
                </div>
                <span className="text-[9px] font-mono text-white/20 animate-pulse">LOCKED</span>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 group/prev relative">
                <img 
                  src={wallpaper.url} 
                  style={{ 
                    transform: `rotate(${currentRotation}deg) scale(${isRotatedSideways ? 1.4 : 1.15})`,
                    objectPosition: `${tempFocal.x}% ${tempFocal.y}%`
                  }}
                  className="w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover/prev:scale-[1.25]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-4 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Live_Sync_Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* 底部功能矩阵 */}
          <div className="space-y-4 mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-bottom-10 duration-700 delay-400">
            <button 
              onClick={handleDownload} 
              disabled={isDownloading} 
              className="relative w-full py-5 bg-gradient-to-r from-pink-500 via-pink-600 to-violet-600 rounded-2xl font-black text-lg shadow-[0_15px_40px_rgba(236,72,153,0.4)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.6)] hover:scale-[1.03] active:scale-95 transition-all text-white disabled:opacity-70 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s]"></div>
              <span className="relative z-10 tracking-[0.15em]">{isDownloading ? 'SYNCHRONIZING...' : '同步高阶次元协议'}</span>
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { onToggleFavorite(wallpaper.id); showToast(wallpaper.isFavorite ? '链路已切断' : '灵魂同步完成'); }} 
                className={`py-4 border rounded-2xl font-black transition-all text-xs tracking-widest uppercase flex items-center justify-center space-x-3 ${
                  wallpaper.isFavorite 
                  ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]' 
                  : 'border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={wallpaper.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <span>{wallpaper.isFavorite ? 'Linked' : 'Link'}</span>
              </button>
              
              <button 
                onClick={() => { 
                  if (confirmDelete) { 
                    onDelete(wallpaper.id); onClose(); 
                  } else { 
                    setConfirmDelete(true); 
                    setTimeout(() => setConfirmDelete(false), 3000); 
                  } 
                }} 
                className={`py-4 border rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2 ${
                  confirmDelete 
                  ? 'border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                  : 'border-white/10 text-white/20 hover:text-red-400/80 hover:border-red-500/20 hover:bg-red-500/5'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                <span>{confirmDelete ? 'Sure?' : 'Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 极简系统通知 */}
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900/80 backdrop-blur-xl px-8 py-3 rounded-full border border-pink-500/30 flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></div>
          <span className="font-bold text-white text-xs tracking-[0.2em] uppercase">{toastMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes pan {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default WallpaperDetail;
