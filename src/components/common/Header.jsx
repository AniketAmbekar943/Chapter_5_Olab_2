import React from 'react';
import { ChevronRight, HelpCircle, RotateCcw, Compass, BookOpen, FlaskConical, CheckCircle2 } from 'lucide-react';
import { useLab } from '../../context/LabContext';

const Header = () => {
  const { currentPage, currentPageMeta, goToPage, setShowTutorial, resetLab, scoreData, PAGE_CONFIG } = useLab();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#071E3D] text-white border-b border-[#12315E] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Breadcrumbs & OLAB Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
          <button 
            onClick={() => goToPage(1)}
            className="flex items-center space-x-2 group focus:outline-none"
            title="Go to Introduction"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm tracking-wider text-white shadow-sm group-hover:bg-blue-500 transition-colors">
              O2
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-200 transition-colors">
              OLAB 2
            </span>
          </button>

          <ChevronRight size={16} className="text-blue-300/60 shrink-0" />

          <div className="flex items-center truncate text-xs sm:text-sm font-medium text-blue-200">
            <span className="truncate">{currentPageMeta?.breadcrumb || currentPageMeta?.title}</span>
          </div>
        </div>

        {/* Right: Quick Controls, How to Use Button, and Page Indicator Pill */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Permanent How to Use Button (Required by Section 7) */}
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-400/30 text-xs font-semibold transition-all duration-150 shadow-sm active:scale-95"
            title="Open Interactive Guide"
          >
            <HelpCircle size={14} className="text-blue-300" />
            <span className="hidden sm:inline">How to Use</span>
          </button>

          {/* Quick Reset Button with confirm */}
          <button
            onClick={() => {
              if (window.confirm('Reset all OLAB 2 progress and restart from Introduction?')) {
                resetLab();
              }
            }}
            className="p-1.5 rounded-full hover:bg-blue-900/60 text-blue-300 hover:text-white transition-colors"
            title="Reset OLAB 2"
          >
            <RotateCcw size={15} />
          </button>

          {/* Page Badge Pill (e.g. 1/8 to 8/8 matching design image) */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400/40 text-blue-100 font-mono text-xs font-bold tracking-wider shadow-inner">
            <span>{currentPage}</span>
            <span className="text-blue-400">/</span>
            <span>{PAGE_CONFIG.length}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
