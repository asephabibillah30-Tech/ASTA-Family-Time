import { useState, useMemo, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useFamilyState } from './hooks/useFamilyState';
import { useAuth } from './hooks/useAuth';
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
import { LoginModal } from './components/Auth/LoginModal';
import { RegisterHeadModal } from './components/Auth/RegisterHeadModal';
import { ManageFamilyModal } from './components/Auth/ManageFamilyModal';
import { SecurityCenterModal } from './components/Auth/SecurityCenterModal';
import { AuthGateScreen } from './components/Auth/AuthGateScreen';
import type { MainTab, AppScreen, Player } from './types/game';

export function App() {
  const game = useGame();
  const auth = useAuth();
  // Pass familyId sehingga data dimuat dari Supabase per keluarga
  const family = useFamilyState(auth.currentFamily?.id ?? null);

  useEffect(() => {
    document.title = 'ASTA Family Time - Satu aplikasi, lebih banyak waktu bersama keluarga.';
  }, []);

  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [subScreen, setSubScreen] = useState<AppScreen | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Auth Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isManageFamilyOpen, setIsManageFamilyOpen] = useState(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);

  // Map family members from auth into Game Players
  const integratedPlayers: Player[] = useMemo(() => {
    if (auth.familyMembers && auth.familyMembers.length > 0) {
      return auth.familyMembers.map((m) => ({
        id: m.id,
        name: m.fullName,
        avatar: m.avatar,
        rolePreset: m.roleTitle,
        score: m.lovePoints || 0,
        cardsCompleted: 0,
        color: m.color || 'bg-blue-500'
      }));
    }
    return game.players;
  }, [auth.familyMembers, game.players]);

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

  // Mandatory Authentication Gate: Must login or register first
  if (!auth.isAuthenticated || !auth.currentUser || !auth.currentFamily) {
    return (
      <AuthGateScreen
        auth={auth}
        onLoginSuccess={() => {
          auth.refreshSession();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern transition-colors select-none">
      
      {/* Universal Header with Auth Status */}
      <Header
        soundEnabled={game.settings.soundEnabled}
        darkMode={game.settings.darkMode}
        currentScreen={game.screen}
        currentUser={auth.currentUser ?? undefined}
        currentFamily={auth.currentFamily ?? undefined}
        onToggleSound={() => game.updateSettings({ soundEnabled: !game.settings.soundEnabled })}
        onToggleDarkMode={() => game.updateSettings({ darkMode: !game.settings.darkMode })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onGoHome={() => {
          game.resetToHome();
          setCurrentTab('home');
          setSubScreen(null);
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenManageFamily={() => setIsManageFamilyOpen(true)}
        onOpenSecurityCenter={() => setIsSecurityCenterOpen(true)}
        onLogout={auth.logout}
        onRestartGame={game.restartSamePlayers}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 pb-24 sm:pb-28 lg:pb-32 flex flex-col justify-start">
        
        {/* If in Active Card Game flow (Player Setup, Mode Select, Game Board, Result) */}
        {game.screen === 'players_setup' && (
          <PlayerSetup
            players={integratedPlayers}
            onAddPlayer={game.addPlayer}
            onRemovePlayer={game.removePlayer}
            onProceedToMode={() => game.setScreen('mode_select')}
          />
        )}

        {game.screen === 'mode_select' && (
          <ModeSelector
            selectedModeId={game.selectedModeId}
            selectedCategories={game.selectedCategories}
            players={integratedPlayers}
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
            players={integratedPlayers}
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
            players={integratedPlayers}
            onPlayAgain={game.restartSamePlayers}
            onGoHome={() => {
              game.resetToHome();
              setCurrentTab('home');
              setSubScreen(null);
            }}
          />
        )}

        {/* Standard Tab Navigation */}
        {game.screen === 'home' && (
          <>
            {/* Sub Screens */}
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
                players={integratedPlayers}
                entries={family.journalEntries}
                onAddEntry={family.addJournalEntry}
                onBack={() => setSubScreen(null)}
              />
            )}

            {subScreen === 'appreciation' && (
              <AppreciationScreen
                players={integratedPlayers}
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

            {/* Main Tabs */}
            {!subScreen && currentTab === 'home' && (
              <DashboardHome
                players={integratedPlayers}
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
                players={integratedPlayers}
                messages={family.chatMessages}
                currentUser={auth.currentUser}
                onSendMessage={family.sendChatMessage}
                onAddReaction={family.addChatReaction}
                onDeleteMessage={family.deleteChatMessage}
                onMarkAsRead={family.markChatMessagesAsRead}
                onResetChat={family.resetChatToDemo}
              />
            )}

            {!subScreen && currentTab === 'game' && (
              <GameHub
                players={integratedPlayers}
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
                players={integratedPlayers}
                familyStreak={family.familyStreak}
                totalLovePoints={family.totalLovePoints}
                onNavigateScreen={handleNavigateSubScreen}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenPlayerSetup={() => {
                  if (auth.isHead) {
                    setIsManageFamilyOpen(true);
                  } else {
                    alert('Hanya Kepala Keluarga yang dapat menambah/mengedit anggota keluarga.');
                  }
                }}
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

      {/* Auth & Family Management Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onLoginSuccess={() => {
          // Success handled in useAuth
        }}
      />

      <RegisterHeadModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onRegisterSuccess={() => {
          // Success handled in useAuth
        }}
      />

      <ManageFamilyModal
        isOpen={isManageFamilyOpen}
        currentUser={auth.currentUser ?? undefined as any}
        currentFamily={auth.currentFamily ?? undefined as any}
        familyMembers={auth.familyMembers}
        onClose={() => setIsManageFamilyOpen(false)}
        onAddMember={auth.addFamilyMember}
        onDeleteMember={auth.deleteFamilyMember}
        onRefresh={() => {
          auth.refreshSession();
        }}
      />

      <SecurityCenterModal
        isOpen={isSecurityCenterOpen}
        currentUser={auth.currentUser ?? undefined as any}
        currentFamily={auth.currentFamily ?? undefined as any}
        onClose={() => setIsSecurityCenterOpen(false)}
      />

      {/* PWA Mobile Install Banner */}
      <PWAInstallPrompt />

    </div>
  );
}

export default App;
