import React, { useState } from 'react';
import type { Player } from '../../types/game';
import { ArrowLeft, Dices, RotateCcw, Coins, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti, fireSmallPop } from '../../utils/confetti';

interface FamilyMonopolyGameProps {
  players: Player[];
  onBack: () => void;
}

const MONOPOLY_TILES = [
  { id: 0, name: 'START / KELUARGA BAHAGIA 🏁', type: 'start', desc: 'Dapat bonus tabungan 50 koin!' },
  { id: 1, name: 'Ruang Tamu Hangat 🛋️', type: 'property', cost: 30, rent: 10 },
  { id: 2, name: 'Celengan Kebaikan 🪙', type: 'chest', desc: 'Ambil kartu hadiah kebaikan!' },
  { id: 3, name: 'Dapur Masak Lezat 🍳', type: 'property', cost: 40, rent: 15 },
  { id: 4, name: 'Taman Bunga Asri 🌻', type: 'property', cost: 50, rent: 20 },
  { id: 5, name: 'Pojok Baca Buku 📚', type: 'property', cost: 60, rent: 25 },
  { id: 6, name: 'Tantangan Kuis Cerdas 🧠', type: 'quiz', desc: 'Jawab kuis dan dapatkan 30 koin!' },
  { id: 7, name: 'Kamar Tidur Nyaman 🛏️', type: 'property', cost: 70, rent: 30 },
  { id: 8, name: 'Halaman Olahraga ⚽', type: 'property', cost: 80, rent: 35 },
  { id: 9, name: 'Ruang Makan Berkah 🍽️', type: 'property', cost: 90, rent: 40 },
  { id: 10, name: 'Liburan Pantai Impian 🏖️', type: 'property', cost: 100, rent: 50 },
  { id: 11, name: 'Kuis Tebak Sayang ❤️', type: 'love', desc: 'Katakan 1 pujian dan dapat 40 koin!' }
];

export const FamilyMonopolyGame: React.FC<FamilyMonopolyGameProps> = ({ players, onBack }) => {
  const [positions, setPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    players.forEach(p => { init[p.id] = 0; });
    return init;
  });

  const [coins, setCoins] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    players.forEach(p => { init[p.id] = 100; }); // Start with 100 coins
    return init;
  });

  const [properties, setProperties] = useState<Record<number, string>>({}); // tileId -> playerId
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [logMessage, setLogMessage] = useState<string>('Selamat datang di Monopoli Keluarga! Mulai dengan 100 Koin.');

  const activePlayer = players[currentTurnIdx % players.length];

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    sound.playCardShuffle();

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 4) + 1);
      count++;
      if (count > 6) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 4) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        processMonopolyTurn(finalRoll);
      }
    }, 90);
  };

  const processMonopolyTurn = (roll: number) => {
    const currentPos = positions[activePlayer.id] || 0;
    const nextPos = (currentPos + roll) % MONOPOLY_TILES.length;
    const passedStart = currentPos + roll >= MONOPOLY_TILES.length;

    let updatedCoins = { ...coins };
    if (passedStart) {
      updatedCoins[activePlayer.id] += 50;
      sound.playSuccess();
      fireSmallPop(0.5, 0.4);
    }

    const tile = MONOPOLY_TILES[nextPos];
    let msg = `${activePlayer.name} melempar dadu ${roll} dan tiba di ${tile.name}.`;

    if (tile.type === 'property' && tile.cost) {
      const ownerId = properties[nextPos];
      if (!ownerId) {
        // Can buy property if enough coins
        if (updatedCoins[activePlayer.id] >= tile.cost) {
          updatedCoins[activePlayer.id] -= tile.cost;
          setProperties(prev => ({ ...prev, [nextPos]: activePlayer.id }));
          msg = `🏠 ${activePlayer.name} berhasil membeli aset ${tile.name} seharga ${tile.cost} koin!`;
          sound.playSuccess();
          fireBurstConfetti();
        } else {
          msg = `${activePlayer.name} tiba di ${tile.name} tetapi koin belum cukup untuk membeli.`;
        }
      } else if (ownerId !== activePlayer.id) {
        // Pay rent
        const owner = players.find(p => p.id === ownerId);
        const rentFee = tile.rent || 10;
        updatedCoins[activePlayer.id] = Math.max(0, updatedCoins[activePlayer.id] - rentFee);
        updatedCoins[ownerId] = (updatedCoins[ownerId] || 0) + rentFee;
        msg = `💰 ${activePlayer.name} mampir ke ${tile.name} milik ${owner?.name} dan membayar sewa ${rentFee} koin!`;
        sound.playClick();
      } else {
        msg = `🏠 ${activePlayer.name} mengunjungi aset miliknya sendiri (${tile.name})!`;
      }
    } else if (tile.type === 'quiz' || tile.type === 'love' || tile.type === 'chest') {
      updatedCoins[activePlayer.id] += 30;
      msg = `🎁 ${tile.name}: ${tile.desc} (+30 Koin)`;
      sound.playFunnyBonus();
      fireBurstConfetti();
    }

    setCoins(updatedCoins);
    setPositions(prev => ({ ...prev, [activePlayer.id]: nextPos }));
    setLogMessage(msg);
    setCurrentTurnIdx(prev => (prev + 1) % players.length);
  };

  const restartMonopoly = () => {
    const initPos: Record<string, number> = {};
    const initCoins: Record<string, number> = {};
    players.forEach(p => {
      initPos[p.id] = 0;
      initCoins[p.id] = 100;
    });
    setPositions(initPos);
    setCoins(initCoins);
    setProperties({});
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setLogMessage('Game direset! Setiap pemain memulai dengan 100 koin.');
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
          <span>🎩</span> Monopoli Keluarga
        </h2>

        <button
          onClick={restartMonopoly}
          className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 active:scale-95"
          title="Mulai Ulang"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Players Coins Standings Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {players.map((p, idx) => {
          const isTurn = idx === (currentTurnIdx % players.length);
          const pCoins = coins[p.id] || 0;

          return (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                isTurn
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 shadow-sm scale-[1.02]'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.avatar}</span>
                <div>
                  <p className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">{p.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Petak {positions[p.id] || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-xl font-display font-black text-xs text-amber-800 dark:text-amber-200">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{pCoins}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-3.5 sm:p-5 border-3 border-amber-200 dark:border-amber-900/60 shadow-bubbly-amber flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">Giliran Bermain</span>
          <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <span>{activePlayer.avatar}</span> {activePlayer.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kocok dadu dan kelilingi aset kebahagiaan keluarga!
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-display font-black text-2xl shadow-md shrink-0">
            {diceValue || '🎲'}
          </div>

          <button
            onClick={rollDice}
            disabled={isRolling}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-display font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Dices className="w-4 h-4" />
            <span>{isRolling ? 'Mengocok...' : 'KOCOK DADU'}</span>
          </button>
        </div>
      </div>

      {/* Log bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <p>{logMessage}</p>
      </div>

      {/* Monopoly Board Grid (12 Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
        {MONOPOLY_TILES.map((tile) => {
          const playersHere = players.filter(p => (positions[p.id] || 0) === tile.id);
          const ownerId = properties[tile.id];
          const owner = players.find(p => p.id === ownerId);

          return (
            <div
              key={tile.id}
              className={`p-3 rounded-2xl border-2 flex flex-col justify-between min-h-[90px] relative transition-all ${
                owner ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div>
                <p className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">{tile.name}</p>
                {tile.cost && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Harga: {tile.cost} 🪙 | Sewa: {tile.rent} 🪙</p>
                )}
                {owner && (
                  <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 mt-1">
                    Milik {owner.name}
                  </span>
                )}
              </div>

              {/* Players on tile */}
              <div className="flex items-center gap-1 mt-2">
                {playersHere.map(p => (
                  <span key={p.id} className="text-xl animate-bounce" title={p.name}>
                    {p.avatar}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
