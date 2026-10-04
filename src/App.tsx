import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { DashboardTab } from './components/tabs/DashboardTab';
import { ActionLogTab } from './components/tabs/ActionLogTab';
import { RuleBuilderTab } from './components/tabs/RuleBuilderTab';
import { RewardShopTab } from './components/tabs/RewardShopTab';
import { FinanceTab } from './components/tabs/FinanceTab';
import { KnowledgeScheduleTab } from './components/tabs/KnowledgeScheduleTab';
import { NewPlayerOnboardingModal } from './components/NewPlayerOnboardingModal';

const MainContent: React.FC = () => {
  const { activeTab } = useGame();

  return (
    <main className="max-w-7xl mx-auto px-4 py-5">
      <NewPlayerOnboardingModal />
      {activeTab === 0 && <DashboardTab />}
      {activeTab === 1 && <ActionLogTab />}
      {activeTab === 2 && <RuleBuilderTab />}
      {activeTab === 3 && <RewardShopTab />}
      {activeTab === 4 && <FinanceTab />}
      {activeTab === 5 && <KnowledgeScheduleTab />}
    </main>
  );
};

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </GameProvider>
  );
}
