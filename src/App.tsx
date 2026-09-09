import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { useFamilyState } from './hooks/useFamilyState';
import { Header } from './components/Header';
import { BottomNav } from './components/Navigation/BottomNav';
import { DashboardHome } from './components/Home/DashboardHome';
import { FamilyChatScreen } from './components/Chat/FamilyChatScreen';
import { GameHub } from './components/Game/GameHub';
import { QualityTimeScreen } from './components/QualityTime/QualityTimeScreen';
import { MemoriesScreen } from './components/Memories/MemoriesScreen';
import { FamilyHubScreen } from './components/FamilyHub/FamilyHubScreen';
import { FamilyPlannerScreen } from './components/FamilyHub/FamilyPlannerScreen';
import { FamilyJournalScreen } from './components/FamilyHub/FamilyJournalScreen';
import { AppreciationScreen } from './components/FamilyHub/AppreciationScreen';
import { FamilyHabitScreen } from './components/FamilyHub/FamilyHabitScreen';
import { FamilyFinanceScreen } from './components/FamilyHub/FamilyFinanceScreen';
import { FamilyLearningScreen } from './components/FamilyHub/FamilyLearningScreen';
import { FamilyAchievementsScreen } from './components/FamilyHub/FamilyAchievementsScreen';
import { PlayerSetup } from './components/PlayerSetup';
import { ModeSelector } from './components/ModeSelector';
import { GameBoard } from './components/GameBoard';
import { ResultScreen } from './components/ResultScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import type { MainTab, AppScreen } from './types/game';

export function App() {
  const game = useGame();
  const family = useFamilyState();

  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [subScreen, setSubScreen] = useState<AppScreen | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Switch tabs
  const handleSelectTab = (tab: MainTab) => {
    setCurrentTab(tab);
    setSubScreen(null);
    game.resetToHome();
  };

  const handleNavigateSubScreen = (screen: AppScreen) => {
    setSubScreen(screen);
  };

  const handleStartCardGame = () => {
    game.setScreen('players_setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern transition-colors select-none">
      
      {/* Universal Header */}
      <Header
        soundEnabled={game.settings.soundEnabled}
        darkMode={game.settings.darkMode}
        currentScreen={game.screen}
        onToggleSound={() => game.updateSettings({ soundEnabled: !game.settings.soundEnabled })}
        onToggleDarkMode={() => game.updateSettings({ darkMode: !game.settings.darkMode })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onGoHome={() => {
          game.resetToHome();
          setCurrentTab('home');
          setSubScreen(null);
        }}
        onRestartGame={game.restartSamePlayers}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full flex flex-col justify-start">
        
        {/* If in Active Card Game flow (Player Setup, Mode Select, Game Board, Result) */}
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
            selectedCategories={game.selectedCategories}
            players={game.players}
            onSelectMode={game.selectMode}
            onToggleCategory={game.toggleCategory}
            onSelectAllCategories={game.selectAllCategories}
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
            onGoHome={() => {
              game.resetToHome();
              setCurrentTab('home');
              setSubScreen(null);
            }}
          />
        )}

        {/* Standard Tab Navigation (when not inside active Card Game session) */}
        {game.screen === 'home' && (
          <>
            {/* Sub Screens (from Family Hub or Dashboard) */}
            {subScreen === 'planner' && (
              <FamilyPlannerScreen
                events={family.plannerEvents}
                onAddEvent={family.addPlannerEvent}
                onToggleEvent={family.togglePlannerEvent}
                onDeleteEvent={family.deletePlannerEvent}
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'journal' && (
              <FamilyJournalScreen
                players={game.players}
                entries={family.journalEntries}
                onAddEntry={family.addJournalEntry}
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'appreciation' && (
              <AppreciationScreen
                players={game.players}
                appreciations={family.appreciations}
                totalLovePoints={family.totalLovePoints}
                onSendAppreciation={family.sendAppreciation}
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'habits' && (
              <FamilyHabitScreen
                habits={family.habits}
                familyStreak={family.familyStreak}
                onToggleHabit={family.toggleHabit}
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'finance' && (
              <FamilyFinanceScreen
                transactions={family.transactions}
                savingsTargets={family.savingsTargets}
                onAddTransaction={family.addFinanceTransaction}
                onDepositSavings={family.depositSavings}
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'learning' && (
              <FamilyLearningScreen
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'achievements' && (
              <FamilyAchievementsScreen
                achievements={family.achievements}
                onBack={() => setSubScreen(null)}
              />
            )}

            {/* Main Tabs (when no subscreen is active) */}
            {!subScreen && currentTab === 'home' && (
              <DashboardHome
                players={game.players}
                dailyIdea={family.currentDailyIdea}
                familyStreak={family.familyStreak}
                totalLovePoints={family.totalLovePoints}
                plannerEvents={family.plannerEvents}
                habits={family.habits}
                onNextIdea={family.nextDailyIdea}
                onNavigateTab={handleSelectTab}
                onStartCardGame={handleStartCardGame}
                onStartSnakeLadders={() => setCurrentTab('game')}
                onOpenJournal={() => setSubScreen('journal')}
                onOpenAppreciation={() => setSubScreen('appreciation')}
                onOpenPlanner={() => setSubScreen('planner')}
              />
            )}

            {!subScreen && currentTab === 'chat' && (
              <FamilyChatScreen
                players={game.players}
                messages={family.chatMessages}
                onSendMessage={family.sendChatMessage}
                onAddReaction={family.addChatReaction}
                onDeleteMessage={family.deleteChatMessage}
              />
            )}

            {!subScreen && currentTab === 'game' && (
              <GameHub
                players={game.players}
                onStartCardGame={handleStartCardGame}
              />
            )}

            {!subScreen && currentTab === 'quality_time' && (
              <QualityTimeScreen
                challenges={family.challenges}
                onToggleChallenge={family.toggleChallenge}
              />
            )}

            {!subScreen && currentTab === 'memories' && (
              <MemoriesScreen
                memories={family.memories}
                onAddMemory={family.addMemory}
                onLikeMemory={family.likeMemory}
                onDeleteMemory={family.deleteMemory}
              />
            )}

            {!subScreen && currentTab === 'family_hub' && (
              <FamilyHubScreen
                players={game.players}
                familyStreak={family.familyStreak}
                totalLovePoints={family.totalLovePoints}
                onNavigateScreen={handleNavigateSubScreen}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenPlayerSetup={() => game.setScreen('players_setup')}
              />
            )}
          </>
        )}

      </main>

      {/* Persistent Bottom Navigation */}
      {game.screen === 'home' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
        />
      )}

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

      {/* PWA Mobile Install Banner */}
      <PWAInstallPrompt />

    </div>
  );
}

export default App;
