import React from 'react';
import { LabProvider, useLab } from './context/LabContext';
import Header from './components/common/Header';
import TutorialModal from './components/common/TutorialModal';
import Page1Introduction from './components/pages/Page1Introduction';
import Page2Theory from './components/pages/Page2Theory';
import Page3ConceptExploration from './components/pages/Page3ConceptExploration';
import Page4HowToUse from './components/pages/Page4HowToUse';
import Page5Simulation1 from './components/pages/Page5Simulation1';
import Page6Simulation2 from './components/pages/Page6Simulation2';
import Page7McqAll from './components/pages/Page7McqAll';
import Page8Completion from './components/pages/Page8Completion';

const LabContent = () => {
  const { currentPage, goToPage, isPageUnlocked, PAGE_CONFIG } = useLab();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return <Page1Introduction />;
      case 2:
        return <Page2Theory />;
      case 3:
        return <Page4HowToUse />;
      case 4:
        return <Page3ConceptExploration />;
      case 5:
        return <Page5Simulation1 />;
      case 6:
        return <Page6Simulation2 />;
      case 7:
        return <Page7McqAll />;
      case 8:
        return <Page8Completion />;
      default:
        return <Page1Introduction />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <Header />

      {/* Main Lab Screen Area */}
      <main className="flex-1 flex flex-col justify-start">
        {renderCurrentPage()}
      </main>

      {/* Interactive First-Time Walkthrough Modal */}
      <TutorialModal />

      {/* Subtle Bottom Stepper Bar for Quick Navigation */}
      <footer className="w-full bg-white border-t border-[#D7E1EC] py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-[#5B6B7A]">
          <span className="font-semibold text-[#064A8C] hidden sm:inline">
            OLAB 2: Genes, Gene Expression & Mutations
          </span>

          {/* Quick page jumper pills with linear progressive unlock gating */}
          <div className="flex items-center space-x-1.5 mx-auto sm:mx-0">
            {Array.from({ length: PAGE_CONFIG.length }, (_, i) => i + 1).map((num) => {
              const isCurrent = currentPage === num;
              const isUnlocked = isPageUnlocked ? isPageUnlocked(num) : (num <= 1);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (isUnlocked && !isCurrent) {
                      goToPage(num);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`w-6 h-6 rounded-md font-mono text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#064A8C] text-white shadow-xs scale-105 cursor-default'
                      : isUnlocked
                      ? 'bg-slate-100 hover:bg-blue-100 hover:text-[#064A8C] text-slate-700 cursor-pointer active:scale-95'
                      : 'bg-slate-100/50 text-slate-300 border border-slate-200/40 cursor-not-allowed opacity-30 select-none pointer-events-none'
                  }`}
                  title={
                    isCurrent
                      ? `Current Page ${num}: ${PAGE_CONFIG[num - 1]?.title}`
                      : isUnlocked
                      ? `Navigate to Page ${num}: ${PAGE_CONFIG[num - 1]?.title}`
                      : `Page ${num} is locked. Complete preceding modules to unlock.`
                  }
                >
                  {num}
                </button>
              );
            })}
          </div>

          <span className="font-mono text-slate-400 hidden sm:inline">
            Interactive Biology Simulation
          </span>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <LabProvider>
      <LabContent />
    </LabProvider>
  );
};

export default App;
