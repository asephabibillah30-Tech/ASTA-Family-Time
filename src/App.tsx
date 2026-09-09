import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { PlayerSetup } from './components/PlayerSetup';
import { ModeSelector } from './components/ModeSelector';
import { GameBoard } from './components/GameBoard';
import { ResultScreen } from './components/ResultScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { ScoreBoard } from './components/ScoreBoard';
import { X } from 'lucide-react';
import { sound } from './utils/sound';

export function App() {
  const game = useGame();
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern transition-colors">
      
      {/* Universal Header */}
      <Header
        soundEnabled={game.settings.soundEnabled}
        darkMode={game.settings.darkMode}
        currentScreen={game.screen}
        onToggleSound={() => game.updateSettings({ soundEnabled: !game.settings.soundEnabled })}
        onToggleDarkMode={() => game.updateSettings({ darkMode: !game.settings.darkMode })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onGoHome={game.resetToHome}
        onRestartGame={game.restartSamePlayers}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full flex flex-col justify-center">
        {game.screen === 'home' && (
          <HomePage
            players={game.players}
            onStartGame={() => game.setScreen('players_setup')}
            onOpenPlayerSetup={() => game.setScreen('players_setup')}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenScoreboard={() => setIsScoreModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {game.screen === 'players_setup' && (
          <PlayerSetup
            players={game.players}
            onAddPlayer={game.addPlayer}
            onRemovePlayer={game.removePlayer}
            onProceedToMode={() => game.setScreen('mode_select')}
          />
        )}

        {game.screen === 'mode_select' && (
          <ModeSelector
            selectedModeId={game.selectedModeId}
            players={game.players}
            onSelectMode={game.selectMode}
            onBackToPlayers={() => game.setScreen('players_setup')}
            onStartGame={game.startGame}
          />
        )}

        {game.screen === 'game_board' && (
          <GameBoard
            currentMode={game.currentMode}
            players={game.players}
            currentPlayer={game.currentPlayer}
            currentPlayerIndex={game.currentPlayerIndex}
            currentCard={game.currentCard}
            isCardFlipped={game.isCardFlipped}
            isShuffling={game.isShuffling}
            cardsRemaining={game.cardsRemaining}
            totalCardsInMode={game.totalCardsInMode}
            turnTransition={game.turnTransition}
            onDrawCard={game.drawCard}
            onSubmitScore={game.submitScore}
            onAdvanceTurn={game.advanceToNextTurn}
            onFinishGame={game.finishGame}
          />
        )}

        {game.screen === 'result' && (
          <ResultScreen
            players={game.players}
            onPlayAgain={game.restartSamePlayers}
            onGoHome={game.resetToHome}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        <p className="flex items-center justify-center gap-1">
          ASTA Family Time &bull; Game Kartu Keluarga ASTA &bull; Menghangatkan Keluarga Indonesia ❤️
        </p>
      </footer>

      {/* Modals */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={game.settings}
        onUpdateSettings={game.updateSettings}
        onResetGame={game.resetToHome}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Standalone Scoreboard Modal (from Home view) */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-bubbly-lg border-4 border-amber-100 dark:border-slate-700">
            <button
              onClick={() => {
                sound.playClick();
                setIsScoreModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-rose-100 hover:text-family-coral transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <ScoreBoard
              players={game.players}
              currentPlayerIndex={game.currentPlayerIndex}
            />

            <button
              onClick={() => {
                sound.playClick();
                setIsScoreModalOpen(false);
              }}
              className="w-full mt-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white font-display font-bold text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
