import React, { useState, useRef, useEffect } from 'react';
import type { Player } from '../../types/game';
import type { ChatMessage } from '../../types/family';
import { Send, PhoneCall, Video, Smile, Trash2, CheckCheck, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireSmallPop } from '../../utils/confetti';

interface FamilyChatScreenProps {
  players: Player[];
  messages: ChatMessage[];
  onSendMessage: (
    senderId: string,
    senderName: string,
    senderAvatar: string,
    senderColor: string,
    text: string,
    mediaType?: ChatMessage['mediaType']
  ) => void;
  onAddReaction: (msgId: string, emoji: string, userId: string) => void;
  onDeleteMessage: (msgId: string) => void;
  onResetChat?: () => void;
}

const QUICK_BUBBLES = [
  'Jangan lupa sholat ya semuanya! 🕌',
  'Makan malam jam berapa nanti? 🍽️',
  'Hati-hati di jalan Ayah/Ibu ❤️',
  'Nanti malam kita main game ASTA ya! 🎴',
  'Semangat belajarnya anak-anak pintar! ⭐',
  'Love you all, keluarga terhebat! 🥰'
];

const QUICK_STICKERS = [
  { emoji: '🤗', label: 'Pelukan Hangat' },
  { emoji: '👏', label: 'Hebat Sekali' },
  { emoji: '🍲', label: 'Makan Enak' },
  { emoji: '☕', label: 'Ngopi Dulu' },
  { emoji: '🎉', label: 'Horeee' },
  { emoji: '❤️', label: 'Sayang Kamu' }
];

export const FamilyChatScreen: React.FC<FamilyChatScreenProps> = ({
  players,
  messages,
  onSendMessage,
  onAddReaction,
  onDeleteMessage,
  onResetChat,
}) => {
  const [selectedSenderId, setSelectedSenderId] = useState<string>(players[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showStickers, setShowStickers] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSender = players.find(p => p.id === selectedSenderId) || players[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(
      activeSender.id,
      activeSender.name,
      activeSender.avatar,
      activeSender.color || 'bg-rose-500',
      inputText.trim(),
      'text'
    );
    setInputText('');
  };

  const handleQuickSend = (text: string) => {
    onSendMessage(
      activeSender.id,
      activeSender.name,
      activeSender.avatar,
      activeSender.color || 'bg-rose-500',
      text,
      'text'
    );
  };

  const handleSendSticker = (sticker: { emoji: string; label: string }) => {
    onSendMessage(
      activeSender.id,
      activeSender.name,
      activeSender.avatar,
      activeSender.color || 'bg-rose-500',
      `${sticker.emoji} ${sticker.label}`,
      'sticker'
    );
    setShowStickers(false);
    sound.playSuccess();
    fireSmallPop(0.5, 0.4);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 pt-1 pb-20 sm:pb-24 flex flex-col h-[calc(100dvh-75px)] sm:h-[calc(100dvh-85px)] gap-2 animate-pop-in">
      
      {/* Top Chat Header */}
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-2.5 rounded-2xl border-2 border-rose-100 dark:border-slate-700 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-xl shadow-sm">
            💬
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                Obrolan Keluarga ASTA
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              {players.length} Anggota Online &bull; Terhubung Dari Jauh ❤️
            </p>
          </div>
        </div>

        {/* Call simulation & Reset buttons */}
        <div className="flex items-center gap-1">
          {onResetChat && (
            <button
              onClick={onResetChat}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 transition-all active:scale-90"
              title="Muat Ulang Pesan Contoh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              sound.playClick();
              setShowCallModal(true);
            }}
            className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 transition-all active:scale-90"
            title="Panggilan Suara Keluarga"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setShowCallModal(true);
            }}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-family-coral transition-all active:scale-90"
            title="Panggilan Video Keluarga"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Switch Sender Identity Strip */}
      <div className="bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-rose-100 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-2xs">
        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 px-1.5 shrink-0">
          Kirim Sebagai:
        </span>
        {players.map((p) => {
          const isSelected = p.id === activeSender.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                sound.playClick();
                setSelectedSenderId(p.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-family-coral text-white shadow-sm scale-102'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-sm">{p.avatar}</span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Feed Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3 sm:p-4 bg-white/90 dark:bg-slate-900/80 rounded-3xl border-2 border-rose-100 dark:border-slate-800 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center text-3xl animate-bounce">
              💌
            </div>
            <div>
              <h3 className="font-display font-black text-slate-800 dark:text-white text-base">
                Obrolan Keluarga ASTA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Kirim pesan hangat atau gunakan tombol pesan cepat di bawah untuk menyapa keluarga ❤️
              </p>
            </div>
            {onResetChat && (
              <button
                onClick={onResetChat}
                className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-family-coral dark:text-rose-300 text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                Muat Contoh Percakapan ✨
              </button>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === activeSender.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <span className="text-2xl mb-1 drop-shadow-xs shrink-0" title={msg.senderName}>
                    {msg.senderAvatar}
                  </span>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 space-y-1 shadow-sm relative group ${
                    isMe
                      ? 'bg-gradient-to-tr from-rose-500 to-family-coral text-white rounded-br-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-rose-100/80 dark:border-slate-700 rounded-bl-xs'
                  }`}
                >
                  {/* Sender Name */}
                  {!isMe && (
                    <p className="text-[11px] font-black text-family-coral dark:text-rose-400">
                      {msg.senderName}
                    </p>
                  )}

                  {/* Content */}
                  <p className={`text-xs sm:text-sm font-medium leading-relaxed break-words ${msg.mediaType === 'sticker' ? 'text-xl font-bold py-1' : ''}`}>
                    {msg.text}
                  </p>

                  {/* Footer time & checkmark */}
                  <div className={`flex items-center justify-end gap-1 text-[9px] ${
                    isMe ? 'text-rose-100' : 'text-slate-400'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* Reaction Badges */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 flex-wrap pt-1">
                      {msg.reactions.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => onAddReaction(msg.id, r.emoji, activeSender.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border shadow-2xs ${
                            isMe 
                              ? 'bg-white/20 border-white/30 text-white' 
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span className="font-extrabold">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Reactions & Delete */}
                  <div className={`flex items-center gap-1 pt-1 opacity-70 group-hover:opacity-100 transition-opacity ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}>
                    {['❤️', '😂', '👍'].map((em) => (
                      <button
                        key={em}
                        onClick={() => onAddReaction(msg.id, em, activeSender.id)}
                        className={`text-xs p-1 rounded-lg transition-transform hover:scale-125 ${
                          isMe ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={`Beri reaksi ${em}`}
                      >
                        {em}
                      </button>
                    ))}
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className={`text-xs p-1 rounded-lg hover:text-red-400 transition-transform ${
                        isMe ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title="Hapus Pesan"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isMe && (
                  <span className="text-2xl mb-1 drop-shadow-xs shrink-0" title={msg.senderName}>
                    {msg.senderAvatar}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Bubble Suggestions */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
        {QUICK_BUBBLES.map((qb, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickSend(qb)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-rose-50 dark:hover:bg-rose-950 transition-all shrink-0 active:scale-95 shadow-2xs"
          >
            {qb}
          </button>
        ))}
      </div>

      {/* Sticker Drawer */}
      {showStickers && (
        <div className="p-3 bg-white dark:bg-slate-800 rounded-3xl border-2 border-rose-200 dark:border-slate-700 shadow-bubbly-sm grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0 animate-pop-in">
          {QUICK_STICKERS.map((st, i) => (
            <button
              key={i}
              onClick={() => handleSendSticker(st)}
              className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 flex flex-col items-center gap-1 transition-all active:scale-90"
            >
              <span className="text-3xl">{st.emoji}</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{st.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Message Bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowStickers(!showStickers);
          }}
          className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 transition-all active:scale-90 shrink-0"
          title="Kirim Stiker Lucu"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder={`Ketik pesan hangat sebagai ${activeSender.name}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:border-family-coral outline-none shadow-sm text-slate-800 dark:text-slate-100"
        />

        <button
          type="submit"
          className="p-3 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white shadow-md active:scale-90 transition-transform shrink-0"
          title="Kirim Pesan"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Family Call Modal Simulation */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-pop-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 p-6 text-white text-center space-y-5 border-4 border-rose-500 shadow-bubbly-lg">
            <div className="w-20 h-20 rounded-full bg-rose-500/30 border-4 border-rose-500 flex items-center justify-center mx-auto text-4xl animate-pulse">
              👨‍👩‍👧‍👦
            </div>

            <div>
              <h3 className="font-display font-black text-xl">
                Ruang Obrolan Suara Keluarga
              </h3>
              <p className="text-xs text-rose-200 mt-1">
                Semua anggota keluarga terhubung dalam kehangatan ❤️
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => (
                <div key={p.id} className="p-2.5 rounded-2xl bg-slate-800 flex items-center gap-2 text-xs font-bold border border-slate-700">
                  <span className="text-xl">{p.avatar}</span>
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowCallModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 font-display font-bold text-xs"
            >
              Tutup Panggilan
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
