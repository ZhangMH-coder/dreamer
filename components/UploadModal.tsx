
import React, { useState, useRef, useEffect } from 'react';

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  title: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (items: { title: string; author: string; url: string; tags: string[] }[]) => void;
  existingTags?: string[];
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, existingTags = [] }) => {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [author, setAuthor] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭标签建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        const id = Math.random().toString(36).substr(2, 9);
        reader.onloadend = () => {
          setItems((prev) => [
            ...prev,
            {
              id,
              file,
              preview: reader.result as string,
              title: file.name.split('.')[0],
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    );
  };

  const handleTagClick = (tag: string) => {
    const currentTags = tagsInput.split(/[\s,，]+/).map(t => t.trim()).filter(t => t !== '');
    if (!currentTags.includes(tag)) {
      const newTagsInput = [...currentTags, tag].join(', ');
      setTagsInput(newTagsInput + (newTagsInput ? ', ' : ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length > 0 && author) {
      const tags = tagsInput.split(/[\s,，]+/).filter(t => t.trim() !== '');
      if (tags.length === 0) tags.push('未分类');

      const uploadPayload = items.map((item) => ({
        title: item.title,
        author,
        url: item.preview,
        tags: tags,
      }));
      onUpload(uploadPayload);
      setItems([]);
      setAuthor('');
      setTagsInput('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass-panel w-full max-w-2xl rounded-3xl p-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full"></div>

        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400 font-black tracking-widest">
          批量导入次元空间
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col overflow-hidden">
          {/* Dropzone */}
          <div 
            className="group relative h-28 bg-white/5 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-pink-500/50 transition-all cursor-pointer flex flex-col items-center justify-center shrink-0 shadow-inner"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-pink-400 group-hover:scale-110 transition-transform">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <span className="text-xs text-gray-400">点击或拖拽添加多张图片</span>
            <input 
              id="file-input"
              type="file" 
              accept="image/*"
              multiple
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* Items List */}
          <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm italic opacity-50">
                尚未选择任何图片...
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-white/5 p-2 rounded-xl border border-white/5 group animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={(e) => updateTitle(item.id, e.target.value)}
                      placeholder="图片标题"
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-600 font-bold"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 统一设置区域 */}
          <div className="grid grid-cols-2 gap-4 shrink-0 relative">
            <div className="space-y-2">
              <label className="text-[10px] text-pink-200 uppercase tracking-widest px-1 font-bold">作者署名</label>
              <input 
                type="text" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="您的称呼"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm text-white placeholder-white/20"
                required
              />
            </div>
            <div className="space-y-2 relative" ref={tagDropdownRef}>
              <label className="text-[10px] text-pink-200 uppercase tracking-widest px-1 font-bold">标签设置 (空格/逗号分隔)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={tagsInput}
                  onFocus={() => setIsTagDropdownOpen(true)}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="例如: 治愈, 唯美, 4K"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm text-white placeholder-white/20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500/40 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              {/* 已选过标签的快速选择区域 */}
              {isTagDropdownOpen && existingTags.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-3 px-1 flex items-center justify-between">
                    <span>快捷选择已有标签</span>
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {existingTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 bg-white/5 hover:bg-pink-500/20 hover:text-pink-300 border border-white/5 rounded-lg text-xs text-white/60 transition-all active:scale-95"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex space-x-4 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-white"
            >
              放弃更改
            </button>
            <button 
              type="submit"
              disabled={items.length === 0 || !author}
              className="flex-[2] px-4 py-3 bg-gradient-to-r from-pink-500 to-violet-600 rounded-xl font-bold shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-95 transition-all text-sm text-white disabled:opacity-50 disabled:pointer-events-none group"
            >
              <span className="relative z-10">发布 {items.length > 0 ? `${items.length} 张` : ''} 幻梦壁纸</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-xl"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
