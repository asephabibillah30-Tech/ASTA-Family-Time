import React, { useState } from 'react';
import type { MemoryItem } from '../../types/family';
import { Plus, Heart, Calendar, Trash2, X } from 'lucide-react';
import { sound } from '../../utils/sound';

interface MemoriesScreenProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'likes'>) => void;
  onLikeMemory: (id: string) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({
  memories,
  onAddMemory,
  onLikeMemory,
  onDeleteMemory,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [album, setAlbum] = useState('Family Night');
  const [tags, setTags] = useState('Keluarga, Bahagia');
  const [selectedAlbumFilter, setSelectedAlbumFilter] = useState('Semua');

  const albums = ['Semua', ...Array.from(new Set(memories.map(m => m.album)))];
  const filteredMemories = selectedAlbumFilter === 'Semua' 
    ? memories 
    : memories.filter(m => m.album === selectedAlbumFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim()) return;

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    onAddMemory({
      title: title.trim(),
      caption: caption.trim(),
      date: new Date().toISOString().split('T')[0],
      album: album.trim() || 'Family Night',
      tags: tagList.length > 0 ? tagList : ['Keluarga']
    });

    setTitle('');
    setCaption('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 animate-pop-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <span className="text-4xl inline-block animate-bounce">📸</span>
          <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white tracking-tight">
            Kenangan & Diary Digital
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Abadikan momen tulus, cerita lucu, dan catatan hangat keluarga tercinta.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsAddModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 hover:from-rose-600 hover:to-family-coral text-white font-display font-black text-xs shadow-bubbly-coral active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>TAMBAH KENANGAN</span>
        </button>
      </div>

      {/* Albums Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {albums.map((alb) => (
          <button
            key={alb}
            onClick={() => {
              sound.playClick();
              setSelectedAlbumFilter(alb);
            }}
            className={`px-4 py-2 rounded-2xl font-display font-bold text-xs shrink-0 transition-all ${
              selectedAlbumFilter === alb
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {alb}
          </button>
        ))}
      </div>

      {/* Memories Timeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-2 border-rose-100 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between hover:border-rose-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-extrabold text-[10px]">
                  {item.album}
                </span>
              </div>

              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl italic">
                "{item.caption}"
              </p>
            </div>

            {/* Tags & Footer Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 flex-wrap">
                {item.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] text-slate-500 font-bold">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLikeMemory(item.id)}
                  className="flex items-center gap-1 text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full active:scale-90 transition-transform"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{item.likes}</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Hapus kenangan ini?')) {
                      onDeleteMemory(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-bubbly-lg border-4 border-rose-200 dark:border-slate-700">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📸</span> Tambah Kenangan Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Momen / Acara:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Family Night #13 / Masak Bersama"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:border-family-coral outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cerita / Caption Hangat:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ceritakan momen lucu atau hal berkesan apa yang terjadi..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:border-family-coral outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Album:
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Family Night"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tag (pisahkan koma):
                  </label>
                  <input
                    type="text"
                    placeholder="Ayah, Ibu, Masak"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-sm shadow-md mt-2 active:scale-95"
              >
                SIMPAN KENANGAN ❤️
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
