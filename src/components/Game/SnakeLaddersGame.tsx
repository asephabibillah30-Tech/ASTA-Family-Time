import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { ArrowLeft, Dices, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireVictoryShower } from '../../utils/confetti';

interface SnakeLaddersGameProps {
  players: Player[];
  onBack: () => void;
}

// 25 tiles board for fast and enjoyable family play
const BOARD_TILES = [
  { id: 1, type: 'start', label: 'Mulai 🏁', action: 'Selamat bermain!' },
  { id: 2, type: 'normal', label: 'Petak 2', action: 'Beri senyum termanis pada keluarga.' },
  { id: 3, type: 'ladder', to: 11, label: 'Tangga 🪜 (ke 11)', action: 'Rajin merapikan tempat tidur! Naik ke 11.' },
  { id: 4, type: 'normal', label: 'Petak 4', action: 'Tos jempol ke semua pemain.' },
  { id: 5, type: 'challenge', label: 'Tantangan 🎯', action: 'Tirukan suara kucing mengeong 3 kali!' },
  { id: 6, type: 'normal', label: 'Petak 6', action: 'Sebutkan 1 makanan kesukaan keluargamu.' },
  { id: 7, type: 'snake', to: 2, label: 'Ular 🐍 (ke 2)', action: 'Lupa mencuci tangan sebelum makan! Turun ke 2.' },
  { id: 8, type: 'ladder', to: 15, label: 'Tangga 🪜 (ke 15)', action: 'Bantu Ayah & Ibu mencuci piring! Naik ke 15.' },
  { id: 9, type: 'challenge', label: 'Tantangan 🎯', action: 'Beri pelukan kilat ke pemain di sebelah kanan.' },
  { id: 10, type: 'normal', label: 'Petak 10', action: 'Pijat bahu pemain di sebelah kirimu 5 detik.' },
  { id: 11, type: 'normal', label: 'Petak 11', action: 'Katakan "Keluarga ini nomor satu!"' },
  { id: 12, type: 'challenge', label: 'Tantangan 🎯', action: 'Goyangkan badan seperti robot selama 10 detik!' },
  { id: 13, type: 'snake', to: 4, label: 'Ular 🐍 (ke 4)', action: 'Begadang main HP! Turun ke 4.' },
  { id: 14, type: 'normal', label: 'Petak 14', action: 'Ucapkan terima kasih pada semua pemain.' },
  { id: 15, type: 'normal', label: 'Petak 15', action: 'Sebutkan 3 hal yang kamu syukuri hari ini.' },
  { id: 16, type: 'ladder', to: 22, label: 'Tangga 🪜 (ke 22)', action: 'Sholat/Ibadah tepat waktu! Naik ke 22.' },
  { id: 17, type: 'snake', to: 9, label: 'Ular 🐍 (ke 9)', action: 'Malas membereskan mainan! Turun ke 9.' },
  { id: 18, type: 'challenge', label: 'Tantangan 🎯', action: 'Tirukan tawa paling heboh!' },
  { id: 19, type: 'normal', label: 'Petak 19', action: 'Doakan kesehatan untuk seluruh keluarga.' },
  { id: 20, type: 'snake', to: 12, label: 'Ular 🐍 (ke 12)', action: 'Bicara ketus saat dipanggil! Turun ke 12.' },
  { id: 21, type: 'normal', label: 'Petak 21', action: 'Beri pujian tulus pada salah satu pemain.' },
  { id: 22, type: 'normal', label: 'Petak 22', action: 'Tunjukkan pose pahlawan super!' },
  { id: 23, type: 'snake', to: 14, label: 'Ular 🐍 (ke 14)', action: 'Lupa belajar untuk ujian! Turun ke 14.' },
  { id: 24, type: 'challenge', label: 'Tantangan 🎯', action: 'Nyanyikan 1 baris lagu ceria!' },
  { id: 25, type: 'finish', label: 'FINISH 🏆', action: 'Selamat! Kamu jadi Pemenang Juara Keluarga!' }
];

export const SnakeLaddersGame: React.FC<SnakeLaddersGameProps> = ({ players, onBack }) => {
  const [positions, setPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    players.forEach(p => { init[p.id] = 1; });
    return init;
  });

  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState<string>('Kocok dadu untuk memulai perjalanan!');
  const [winner, setWinner] = useState<Player | null>(null);

  const activePlayer = players[currentTurnIdx % players.length];

  const rollDice = () => {
    if (isRolling || winner) return;

    setIsRolling(true);
    sound.playCardShuffle();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        processMove(finalRoll);
      }
    }, 80);
  };

  const processMove = (roll: number) => {
    const currentPos = positions[activePlayer.id] || 1;
    let newPos = currentPos + roll;

    if (newPos >= 25) {
      newPos = 25;
      setPositions(prev => ({ ...prev, [activePlayer.id]: 25 }));
      setWinner(activePlayer);
      sound.playVictory();
      fireVictoryShower();
      setLastActionMessage(`🎉 ${activePlayer.name} mencapai garis FINISH dan menjadi Juara!`);
      return;
    }

    const tile = BOARD_TILES.find(t => t.id === newPos);
    let finalPos = newPos;
    let msg = `${activePlayer.name} melempar dadu ${roll} dan mendarat di petak ${newPos}.`;

    if (tile?.type === 'ladder' && tile.to) {
      finalPos = tile.to;
      msg = `🪜 Hore! ${tile.action} Naik ke petak ${finalPos}!`;
      sound.playSuccess();
      fireBurstConfetti();
    } else if (tile?.type === 'snake' && tile.to) {
      finalPos = tile.to;
      msg = `🐍 Ups! ${tile.action} Turun ke petak ${finalPos}.`;
      sound.playSkip();
    } else if (tile?.type === 'challenge') {
      msg = `🎯 Tantangan: ${tile.action}`;
      sound.playFunnyBonus();
    } else {
      msg = `💬 ${tile?.action || 'Lanjutkan permainan!'}`;
      sound.playClick();
    }

    setPositions(prev => ({ ...prev, [activePlayer.id]: finalPos }));
    setLastActionMessage(msg);
    setCurrentTurnIdx(prev => (prev + 1) % players.length);
  };

  const restartGame = () => {
    const init: Record<string, number> = {};
    players.forEach(p => { init[p.id] = 1; });
    setPositions(init);
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setWinner(null);
    setLastActionMessage('Permainan baru dimulai! Silakan kocok dadu.');
    sound.playClick();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-5 animate-pop-in">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Game Hub</span>
        </button>

        <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>🎲</span> Ular Tangga Keluarga
        </h2>

        <button
          onClick={restartGame}
          className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 active:scale-95"
          title="Mulai Ulang"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Current Turn & Dice Controller */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-3 border-teal-200 dark:border-teal-900/60 shadow-bubbly-teal flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Active Player */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-3xl border-2 border-rose-300 shadow-sm animate-pulse-fast">
            {activePlayer.avatar}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-rose-500 tracking-wider">
              Giliran Melempar Dadu
            </span>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              {activePlayer.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Posisi Sekarang: Petak {positions[activePlayer.id] || 1}
            </p>
          </div>
        </div>

        {/* Dice & Action */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-display font-black text-3xl shadow-md">
            {diceValue || '🎲'}
          </div>

          {!winner ? (
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-display font-black text-base shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Dices className="w-5 h-5" />
              <span>{isRolling ? 'Mengocok...' : 'KOCOK DADU'}</span>
            </button>
          ) : (
            <button
              onClick={restartGame}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-family-coral to-rose-600 text-white font-display font-black text-base shadow-md flex items-center gap-2 active:scale-95"
            >
              <Trophy className="w-5 h-5" />
              <span>MAIN LAGI</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notice Bar */}
      <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2.5 shadow-sm">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        <p>{lastActionMessage}</p>
      </div>

      {/* 25 Board Tiles Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-white/70 dark:bg-slate-800/70 p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
        {BOARD_TILES.slice().reverse().map((tile) => {
          const playersOnTile = players.filter(p => (positions[p.id] || 1) === tile.id);

          return (
            <div
              key={tile.id}
              className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-2xl border-2 flex flex-col justify-between relative transition-all ${
                tile.type === 'start'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300'
                  : tile.type === 'finish'
                  ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 font-bold'
                  : tile.type === 'ladder'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300'
                  : tile.type === 'snake'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  {tile.id}
                </span>
                <span className="text-xs">
                  {tile.type === 'ladder' ? '🪜' : tile.type === 'snake' ? '🐍' : tile.type === 'challenge' ? '🎯' : ''}
                </span>
              </div>

              {/* Players Avatars on this tile */}
              <div className="flex items-center gap-1 flex-wrap my-1">
                {playersOnTile.map(p => (
                  <span
                    key={p.id}
                    className="text-lg sm:text-xl drop-shadow animate-bounce"
                    title={p.name}
                  >
                    {p.avatar}
                  </span>
                ))}
              </div>

              <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                {tile.label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
