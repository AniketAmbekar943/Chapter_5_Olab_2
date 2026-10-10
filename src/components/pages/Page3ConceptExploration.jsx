import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  ChevronDown, 
  Info, 
  Settings, 
  Link2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Sparkles,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import Nested3DViewer from '../viewer/Nested3DViewer';
import { 
  HIERARCHY_LEVELS, 
  KEY_TAKEAWAYS_DATA, 
  getHierarchyLevel, 
  getHierarchyLevelByIndex 
} from '../../data/hierarchyData';

/**
 * Section 3: Concept Exploration — Interactive 3D Molecular Explorer
 * Features manual exploration (single-click inspect, double-click zoom, orbit/pan)
 * and automatic guided exploration (step-by-step camera traverse + 3-second information reading intervals).
 */
const Page3ConceptExploration = () => {
  const { prevPage, nextPage } = useLab();

  // Current active hierarchy scale (level id: 'cell', 'nucleus', etc.)
  const [currentLevelId, setCurrentLevelId] = useState('cell');

  // Selected subcomponent (if user clicked a specific organelle or chemical group)
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Right-side info panel active tab: 'info' | 'takeaways'
  const [activeInfoTab, setActiveInfoTab] = useState('info');

  // Top-left level selector dropdown open/closed
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  // Independent label visibility state per biological scale/model (defaults to true for all models)
  const [levelLabelsVisibility, setLevelLabelsVisibility] = useState({
    cell: true,
    nucleus: true,
    chromosome: true,
    dna: true,
    gene: true,
    base_pair: true,
    bonds: true,
  });

  const isCurrentModelLabelsVisible = levelLabelsVisibility[currentLevelId] !== false;

  const handleToggleCurrentModelLabels = useCallback(() => {
    setLevelLabelsVisibility((prev) => ({
      ...prev,
      [currentLevelId]: !(prev[currentLevelId] !== false),
    }));
  }, [currentLevelId]);

  // Auto Exploration state machine
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoStepIndex, setAutoStepIndex] = useState(0);
  const [isReadingInterval, setIsReadingInterval] = useState(false);
  const [readingSecondsRemaining, setReadingSecondsRemaining] = useState(3);
  const [isAutoCompleted, setIsAutoCompleted] = useState(false);

  // Timers and cancellation refs
  const readingTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const currentLevel = getHierarchyLevel(currentLevelId);
  const currentIndex = HIERARCHY_LEVELS.findIndex((l) => l.id === currentLevelId);

  // Clear all pending automatic timers
  const clearAutoTimers = useCallback(() => {
    if (readingTimerRef.current) {
      clearTimeout(readingTimerRef.current);
      readingTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsReadingInterval(false);
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearAutoTimers();
    };
  }, [clearAutoTimers]);

  // Handle camera transition completion callback from 3D viewer
  const handleTransitionComplete = useCallback((arrivedLevelId) => {
    if (!isAutoPlaying || isPaused) return;

    // Start 3-second information reading interval AFTER camera settles
    setIsReadingInterval(true);
    setReadingSecondsRemaining(3);

    // 1-second countdown display updater
    countdownIntervalRef.current = setInterval(() => {
      setReadingSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Exact 3-second reading timer
    readingTimerRef.current = setTimeout(() => {
      clearAutoTimers();

      setAutoStepIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < HIERARCHY_LEVELS.length) {
          const nextLvl = HIERARCHY_LEVELS[nextIndex];
          setCurrentLevelId(nextLvl.id);
          setSelectedComponent(null);
          return nextIndex;
        } else {
          // Completed all 7 steps
          setIsAutoPlaying(false);
          setIsAutoCompleted(true);
          return prevIndex;
        }
      });
    }, 3000);
  }, [isAutoPlaying, isPaused, clearAutoTimers]);

  // Start / Resume Auto Exploration
  const handleStartAuto = () => {
    clearAutoTimers();
    setIsAutoCompleted(false);

    if (isPaused) {
      setIsPaused(false);
      return;
    }

    setIsAutoPlaying(true);
    setIsPaused(false);

    // If currently at the end, restart from step 0 (Cell)
    if (autoStepIndex >= HIERARCHY_LEVELS.length - 1 || isAutoCompleted) {
      setAutoStepIndex(0);
      setCurrentLevelId(HIERARCHY_LEVELS[0].id);
      setSelectedComponent(null);
    } else {
      // Continue from current level
      setAutoStepIndex(currentIndex);
    }
  };

  // Pause Auto Exploration
  const handlePauseAuto = () => {
    clearAutoTimers();
    setIsPaused(true);
  };

  // Resume Auto Exploration
  const handleResumeAuto = () => {
    setIsPaused(false);
    // Trigger transition to current step
    handleTransitionComplete(currentLevelId);
  };

  // Previous Step in Auto Mode
  const handlePreviousStep = () => {
    clearAutoTimers();
    const prevIndex = Math.max(0, autoStepIndex - 1);
    setAutoStepIndex(prevIndex);
    setCurrentLevelId(HIERARCHY_LEVELS[prevIndex].id);
    setSelectedComponent(null);
  };

  // Next Step in Auto Mode
  const handleNextStep = () => {
    clearAutoTimers();
    const nextIndex = Math.min(HIERARCHY_LEVELS.length - 1, autoStepIndex + 1);
    setAutoStepIndex(nextIndex);
    setCurrentLevelId(HIERARCHY_LEVELS[nextIndex].id);
    setSelectedComponent(null);
  };

  // Restart Auto Exploration
  const handleRestartAuto = () => {
    clearAutoTimers();
    setIsAutoCompleted(false);
    setAutoStepIndex(0);
    setCurrentLevelId(HIERARCHY_LEVELS[0].id);
    setSelectedComponent(null);
    setIsAutoPlaying(true);
    setIsPaused(false);
  };

  // Manual Level Selection (from step strip or dropdown)
  const handleSelectLevel = (levelId) => {
    clearAutoTimers();
    setIsAutoPlaying(false);
    setIsPaused(false);
    setIsAutoCompleted(false);

    setCurrentLevelId(levelId);
    setSelectedComponent(null);
    setShowLevelDropdown(false);

    const newIdx = HIERARCHY_LEVELS.findIndex((l) => l.id === levelId);
    if (newIdx !== -1) setAutoStepIndex(newIdx);
  };

  // Manual Single-Click Component Inspection
  const handleSelectComponent = (comp) => {
    // If auto mode is playing, pause safely
    if (isAutoPlaying) {
      clearAutoTimers();
      setIsPaused(true);
    }
    setSelectedComponent(comp);
    setActiveInfoTab('info');
  };

  // Manual Double-Click Drill-Down Navigation
  const handleDrillDown = (childId) => {
    if (childId) {
      handleSelectLevel(childId);
    }
  };

  // Active item to display in the Component Info panel
  const activeTitle = selectedComponent?.name || currentLevel.title;
  const activeSubtitle = selectedComponent?.subtitle || currentLevel.subtitle;
  const activeDesc = selectedComponent?.desc || selectedComponent?.definition || currentLevel.explanation;
  const activeFunctions = selectedComponent?.keyFunctions || currentLevel.keyFunctions;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Page Header matching screenshot */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] tracking-tight">
          Concept Exploration
        </h1>
        <h2 className="text-base sm:text-lg font-bold text-[#064A8C]">
          Interactive 3D Molecular Explorer
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B7A] max-w-4xl leading-relaxed">
          Explore the hierarchical structure from cell to molecular bonds. Use the automatic exploration or interact manually by clicking on components.
        </p>
      </div>

      {/* 2. Main 3D Viewport & Right-Side Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (8 cols): 3D Viewport Card */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          <div className="relative">
            {/* Top-Left Level Selector Dropdown matching screenshot */}
            <div className="absolute top-4 left-4 z-20">
              <div className="relative">
                <button
                  onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700/80 text-xs sm:text-sm font-bold tracking-tight shadow-xl backdrop-blur-md transition-all active:scale-95"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{currentLevel.label}</span>
                  <ChevronDown size={15} className={`text-slate-400 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLevelDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-slate-900/95 border border-slate-700/90 shadow-2xl p-1.5 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Select Biological Scale
                    </div>
                    <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                      {HIERARCHY_LEVELS.map((lvl) => {
                        const isSelected = lvl.id === currentLevelId;
                        return (
                          <button
                            key={lvl.id}
                            onClick={() => handleSelectLevel(lvl.id)}
                            className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-[#064A8C] text-white'
                                : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <span>{lvl.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">{lvl.scale}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Three.js 3D Viewer */}
            <Nested3DViewer
              currentLevelId={currentLevelId}
              selectedComponent={selectedComponent}
              onSelectComponent={handleSelectComponent}
              onDrillDown={handleDrillDown}
              isAutoPlaying={isAutoPlaying}
              isPaused={isPaused}
              onTransitionComplete={handleTransitionComplete}
              showLabels={isCurrentModelLabelsVisible}
              onToggleLabels={handleToggleCurrentModelLabels}
            />
          </div>

          {/* Auto Exploration Controls Bar directly below viewer matching screenshot */}
          <div className="bg-white rounded-2xl border border-[#D7E1EC] shadow-sm p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Primary Action Button */}
            <button
              onClick={isAutoPlaying ? (isPaused ? handleResumeAuto : handlePauseAuto) : handleStartAuto}
              className={`w-full sm:w-auto inline-flex items-center space-x-3 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-95 ${
                isAutoPlaying && !isPaused
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#064A8C] hover:bg-[#085aa8]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                {isAutoPlaying && !isPaused ? (
                  <Pause size={18} className="text-white" />
                ) : (
                  <Play size={18} className="text-white fill-white ml-0.5" />
                )}
              </div>
              <div className="text-left">
                <span className="block leading-tight">
                  {isAutoPlaying 
                    ? (isPaused ? 'Resume Auto Exploration' : 'Pause Auto Exploration')
                    : 'Start Auto Exploration'
                  }
                </span>
                <span className="text-[11px] font-normal text-blue-100/80 block">
                  {isAutoPlaying && isReadingInterval
                    ? `Reading for ${readingSecondsRemaining}s...`
                    : 'Watch the components automatically'
                  }
                </span>
              </div>
            </button>

            {/* Transport Secondary Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={isPaused ? handleResumeAuto : handlePauseAuto}
                disabled={!isAutoPlaying}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>

              <button
                onClick={handlePreviousStep}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                title="Previous Component"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={handleNextStep}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                title="Next Component"
              >
                <SkipForward size={16} />
              </button>

              <button
                onClick={handleRestartAuto}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                title="Restart Demonstration"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Step Counter & Dot Progress */}
            <div className="flex items-center space-x-3 text-right">
              <div>
                <span className="text-xs font-bold text-[#14213D] block font-mono">
                  Step {currentIndex + 1} / {HIERARCHY_LEVELS.length}
                </span>
                <span className="text-[11px] text-[#5B6B7A] font-medium block">
                  {currentLevel.label}
                </span>
              </div>

              {/* 7 dots indicator matching screenshot */}
              <div className="flex items-center space-x-1.5">
                {HIERARCHY_LEVELS.map((lvl, idx) => (
                  <div
                    key={lvl.id}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'bg-[#064A8C] scale-125 ring-2 ring-blue-200'
                        : idx < currentIndex
                        ? 'bg-blue-300'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Component Information Panel matching screenshot */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#D7E1EC] shadow-lab-card p-5 sm:p-6 space-y-5">
          
          {/* Top Switcher Tabs: Component Info vs Key Takeaways matching screenshot */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveInfoTab('info')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                activeInfoTab === 'info'
                  ? 'bg-[#064A8C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Component Info
            </button>
            <button
              onClick={() => setActiveInfoTab('takeaways')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                activeInfoTab === 'takeaways'
                  ? 'bg-[#064A8C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Key Takeaways
            </button>
          </div>

          {activeInfoTab === 'info' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Component Header Card with Thumbnail on left */}
              <div className="flex items-start space-x-3.5 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-sm">
                  <img
                    src={currentLevel.thumbnail}
                    alt={currentLevel.shortName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-[#14213D] leading-snug">
                      {activeTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#064A8C] text-[10px] font-bold font-mono shrink-0">
                      {currentLevel.levelBadge}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6B7A] font-medium mt-0.5">
                    {activeSubtitle}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Scale: {currentLevel.scale}
                  </p>
                  {selectedComponent && (
                    <button
                      onClick={() => setSelectedComponent(null)}
                      className="text-[11px] font-semibold text-[#064A8C] hover:underline flex items-center space-x-1 mt-1.5 cursor-pointer"
                    >
                      <span>← View {currentLevel.shortName} overview</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Concise Explanation */}
              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  {activeDesc}
                </p>
              </div>

              {/* Key Functions Section with Icon matching screenshot */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#14213D]">
                  <Settings size={15} className="text-[#064A8C]" />
                  <span>Key Functions</span>
                </div>
                <ul className="space-y-2 text-xs text-[#475569]">
                  {activeFunctions.map((func, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#064A8C] shrink-0 mt-1.5" />
                      <span className="leading-snug">{func}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Concepts Tags Section with Authoritative Educational Links */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#14213D]">
                    <Link2 size={15} className="text-[#064A8C]" />
                    <span>Related Concepts</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Educational Resources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentLevel.relatedConcepts.map((concept, i) => {
                    const label = typeof concept === 'string' ? concept : concept.label;
                    const url = typeof concept === 'string'
                      ? `https://www.google.com/search?q=openstax+biology+${encodeURIComponent(concept)}`
                      : concept.url;
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 hover:border-blue-300 text-[#064A8C] text-[11px] font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-95 group/link"
                        title={`Open educational resource for ${label}`}
                      >
                        <span>{label}</span>
                        <ExternalLink size={11} className="text-blue-500 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-xs font-bold text-[#14213D]">
                <BookOpen size={16} className="text-[#064A8C]" />
                <span>Multiscale Biological Architecture</span>
              </div>
              <div className="space-y-3">
                {KEY_TAKEAWAYS_DATA.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
                    <h4 className="text-xs font-bold text-[#064A8C]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 3. Seven-Step Biological Hierarchy Strip matching screenshot */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#14213D] px-1">
          <span className="flex items-center space-x-1.5">
            <Layers size={14} className="text-[#064A8C]" />
            <span>Biological Scale Progression</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            Click any step to inspect • Scale decreases left to right
          </span>
        </div>

        <div className="flex items-stretch space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {HIERARCHY_LEVELS.map((lvl, index) => {
            const isSelected = lvl.id === currentLevelId;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id)}
                className={`flex-1 min-w-[125px] sm:min-w-[140px] rounded-2xl p-2.5 border text-left transition-all duration-200 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#064A8C] bg-[#EAF4FF]/40 shadow-md ring-2 ring-[#064A8C]/20 scale-[1.02]'
                    : 'border-[#D7E1EC] bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                {/* Thumbnail image */}
                <div className="w-full h-16 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 mb-2">
                  <img
                    src={lvl.thumbnail}
                    alt={lvl.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Step badge & Title */}
                <div>
                  <span className={`text-[10px] font-mono font-bold block ${
                    isSelected ? 'text-[#064A8C]' : 'text-slate-400'
                  }`}>
                    {lvl.stepNumber}. {lvl.shortName}
                  </span>
                  <span className="text-xs font-extrabold text-[#14213D] leading-tight block truncate mt-0.5">
                    {lvl.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Educational Tip Bar matching screenshot */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#EAF4FF] border border-[#064A8C]/20 flex items-center space-x-3 text-xs sm:text-sm text-[#064A8C]">
        <div className="w-6 h-6 rounded-full bg-[#064A8C] text-white flex items-center justify-center font-bold text-xs shrink-0">
          i
        </div>
        <p className="font-medium leading-relaxed">
          <strong>Tip:</strong> Click on any component to view its information. Double-click to explore the next level. Or use the automatic exploration to see the complete sequence.
        </p>
      </div>

      {/* 5. Section Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prevPage}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-[#D7E1EC] bg-white text-[#5B6B7A] hover:text-[#14213D] font-bold text-sm transition-all"
          title="Back to Section 3: Simulation Demo"
        >
          <ChevronLeft size={16} />
          <span>Simulation Demo</span>
        </button>

        <button
          onClick={nextPage}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-sm shadow-lab-button transition-all active:scale-95"
        >
          <span>Activity 1</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default Page3ConceptExploration;
