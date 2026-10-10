import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Dna, 
  GripVertical, 
  X, 
  Wand2, 
  Info,
  Check,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLab } from '../../context/LabContext';
import { 
  SIMULATION_1_DEFAULT_DNA, 
  DNA_TO_RNA_COMPLEMENT, 
  getCodons, 
  translateMrna 
} from '../../data/geneticCode';

const BASE_STYLES = {
  A: {
    name: 'Adenine',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    badge: 'bg-emerald-500 text-white',
    pill: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    glow: 'ring-emerald-400',
    btn: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200',
    bonds: 2, // A = T / A = U
  },
  T: {
    name: 'Thymine',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-800',
    badge: 'bg-rose-500 text-white',
    pill: 'bg-rose-100 border-rose-300 text-rose-800',
    glow: 'ring-rose-400',
    btn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200',
    bonds: 2,
  },
  U: {
    name: 'Uracil',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-800',
    badge: 'bg-purple-600 text-white',
    pill: 'bg-purple-100 border-purple-300 text-purple-800',
    glow: 'ring-purple-400',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200',
    bonds: 2, // U = A (replaces T in RNA)
  },
  C: {
    name: 'Cytosine',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-800',
    badge: 'bg-sky-500 text-white',
    pill: 'bg-sky-100 border-sky-300 text-sky-800',
    glow: 'ring-sky-400',
    btn: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200',
    bonds: 3, // C ≡ G
  },
  G: {
    name: 'Guanine',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    badge: 'bg-amber-500 text-white',
    pill: 'bg-amber-100 border-amber-300 text-amber-800',
    glow: 'ring-amber-400',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    bonds: 3,
  },
};

const RNA_PALETTE = ['A', 'U', 'C', 'G'];

const Page5Simulation1 = () => {
  const { prevPage, nextPage, sim1State, setSim1State } = useLab();
  const isCompleted = Boolean(sim1State?.completed);

  const dnaTemplate = SIMULATION_1_DEFAULT_DNA; // 'TACCGATGCCTTA' (13 bases)
  const expectedMrnaArray = dnaTemplate.split('').map(b => DNA_TO_RNA_COMPLEMENT[b]);

  // Slots array of 13 positions, initialized with any previously saved bases
  const [slots, setSlots] = useState(() => {
    const arr = Array(dnaTemplate.length).fill(null);
    if (Array.isArray(sim1State.transcribedBases) && sim1State.transcribedBases.length > 0) {
      sim1State.transcribedBases.forEach((b, i) => {
        if (i < dnaTemplate.length) arr[i] = b;
      });
    }
    return arr;
  });

  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'info', text: string, mistakeIdx?: number }
  const [showHint, setShowHint] = useState(false);
  const [simStep, setSimStep] = useState(sim1State.currentStep || 2); // Default to Step 2 (Drag & Drop activity)
  const [draggedBase, setDraggedBase] = useState(null); // { base: string, source: 'palette' | 'slot', sourceIndex?: number }
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [validationResults, setValidationResults] = useState(null); // Array<{ correct: boolean, expected: string }> | null
  const [selectedBaseToPlace, setSelectedBaseToPlace] = useState(null); // For tap/click placement mode on mobile/touch

  // Touch drag tracking ref
  const touchDragRef = useRef(null);

  // Helper to place base in a specific slot
  const placeBaseInSlot = (slotIndex, base) => {
    if (slotIndex < 0 || slotIndex >= dnaTemplate.length) return;
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = base;
      return next;
    });
    setFeedback(null);
    setValidationResults(null);
  };

  // Clear a specific slot
  const handleClearSlot = (index, e) => {
    if (e) e.stopPropagation();
    setSlots(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setFeedback(null);
    setValidationResults(null);
  };

  // Find next empty slot
  const nextEmptySlotIndex = slots.findIndex(s => s === null);

  // Quick-click placement (ideal for mobile or fast entry)
  const handlePaletteClick = (base) => {
    const targetIdx = nextEmptySlotIndex !== -1 ? nextEmptySlotIndex : slots.length - 1;
    placeBaseInSlot(targetIdx, base);
    setSelectedBaseToPlace(null);
  };

  // Drag start from Palette
  const handleDragStartFromPalette = (e, base) => {
    const dragData = { base, source: 'palette' };
    setDraggedBase(dragData);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drag start from existing Slot
  const handleDragStartFromSlot = (e, base, index) => {
    const dragData = { base, source: 'slot', sourceIndex: index };
    setDraggedBase(dragData);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag Over on a Slot
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  // Drag Leave from a Slot
  const handleDragLeave = (index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  // Drop onto a Slot
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    let data = draggedBase;
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (rawData) {
        data = JSON.parse(rawData);
      }
    } catch {
      // fallback to state
    }

    if (!data || !data.base) return;

    if (data.source === 'slot' && data.sourceIndex !== undefined) {
      // Moving base from another slot to this slot
      const sourceIdx = data.sourceIndex;
      if (sourceIdx !== targetIndex) {
        setSlots(prev => {
          const next = [...prev];
          const existingTargetBase = next[targetIndex];
          next[targetIndex] = data.base;
          next[sourceIdx] = existingTargetBase; // swap
          return next;
        });
        setFeedback(null);
        setValidationResults(null);
      }
    } else {
      // Placing from palette into target slot
      placeBaseInSlot(targetIndex, data.base);
    }

    setDraggedBase(null);
  };

  // Drag End handler
  const handleDragEnd = () => {
    setDraggedBase(null);
    setDragOverIndex(null);
  };

  // Touch Support: Tap-to-select for mobile devices
  const handleTouchStart = (base) => {
    touchDragRef.current = { base, startX: 0, startY: 0 };
    setSelectedBaseToPlace(base);
  };

  // Check Transcription
  const handleCheck = () => {
    const filledCount = slots.filter(s => s !== null).length;
    if (filledCount === 0) {
      setFeedback({
        type: 'error',
        text: 'The mRNA strand is empty! Drag and drop complementary RNA bases (A, U, C, G) into the slots above.',
      });
      return;
    }

    // Evaluate each slot
    const results = slots.map((userBase, idx) => {
      const expected = expectedMrnaArray[idx];
      return {
        userBase,
        expected,
        isCorrect: userBase === expected,
      };
    });

    setValidationResults(results);

    // Look for first mistake
    const firstMistakeIdx = results.findIndex(r => r.userBase !== null && !r.isCorrect);
    const hasEmptySlot = results.some(r => r.userBase === null);

    if (firstMistakeIdx !== -1) {
      const wrongDnaBase = dnaTemplate[firstMistakeIdx];
      const correctRna = expectedMrnaArray[firstMistakeIdx];
      const userWrongRna = slots[firstMistakeIdx];
      
      setFeedback({
        type: 'error',
        mistakeIdx: firstMistakeIdx,
        text: `Mistake at position ${firstMistakeIdx + 1}: DNA template base "${wrongDnaBase}" pairs with RNA "${correctRna}", not "${userWrongRna}". Remember: in RNA, Uracil (U) pairs with Adenine (A)!`,
      });
      setSim1State(prev => ({ ...prev, mistakes: (prev.mistakes || 0) + 1 }));
    } else if (hasEmptySlot) {
      setFeedback({
        type: 'info',
        text: `All ${filledCount} placed bases are correct so far! Drag the remaining ${dnaTemplate.length - filledCount} bases to complete the mRNA strand.`,
      });
    } else {
      // 100% accurate!
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 }
        });
      } catch {
        // ignore
      }

      setFeedback({
        type: 'success',
        text: 'Fantastic! RNA Polymerase has accurately synthesized the full 13-nucleotide mRNA strand.',
      });

      setSimStep(3); // Advance to Codons & Translation
      setSim1State(prev => ({
        ...prev,
        completed: true,
        currentStep: 3,
        transcribedBases: slots,
      }));
    }
  };

  // Auto-fill demo
  const handleAutoFill = () => {
    setSlots([...expectedMrnaArray]);
    setValidationResults(expectedMrnaArray.map(b => ({ userBase: b, expected: b, isCorrect: true })));
    setFeedback({
      type: 'success',
      text: 'Demonstration complete! Complementary mRNA sequence synthesized accurately.',
    });
    setSimStep(3);
    setSim1State(prev => ({
      ...prev,
      completed: true,
      currentStep: 3,
      transcribedBases: expectedMrnaArray,
    }));
  };

  // Reset entire activity
  const handleReset = () => {
    setSlots(Array(dnaTemplate.length).fill(null));
    setFeedback(null);
    setShowHint(false);
    setValidationResults(null);
    setSimStep(2);
    setSelectedBaseToPlace(null);
    setSim1State(prev => ({
      ...prev,
      completed: false,
      currentStep: 2,
      transcribedBases: [],
    }));
  };

  // Backspace last filled slot
  const handleRemoveLast = () => {
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] !== null) {
        handleClearSlot(i);
        break;
      }
    }
  };

  const filledSlotsCount = slots.filter(s => s !== null).length;
  const mrnaString = slots.map(s => s || '-').join('');
  const completeMrnaString = slots.every(s => s !== null) ? slots.join('') : expectedMrnaArray.join('');
  const codons = getCodons(completeMrnaString);
  const translatedProtein = translateMrna(completeMrnaString);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">
      
      {/* Main Interactive Stage */}
      <div className="bg-white rounded-2xl border border-[#D7E1EC] shadow-lab-card p-5 sm:p-8 space-y-6">
        
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#064A8C] border border-blue-200">
                Interactive Drag & Drop
              </span>
              <span className="text-xs text-slate-400 font-medium">Activity 1</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight mt-1">
              Drag & Drop mRNA Transcription
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5B6B7A]">
              Drag RNA nucleotides (A, U, C, G) from the palette and drop them into the matching mRNA slots below the DNA template.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle size={15} className="text-amber-600" />
              <span>{showHint ? 'Hide Hint' : 'Base Pairing Rules'}</span>
            </button>
            <button
              onClick={handleAutoFill}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Auto-fill correct sequence demonstration"
            >
              <Wand2 size={14} className="text-blue-600" />
              <span>Auto-Fill</span>
            </button>
          </div>
        </div>

        {/* Hint Box (when requested) */}
        {showHint && (
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm animate-in fade-in duration-200">
            <div className="flex items-start space-x-3">
              <HelpCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold text-amber-950">Transcription Base Pairing Rules (Chargaff & RNA specifics):</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white/80 border border-amber-200 font-mono text-center">
                    DNA <strong className="text-rose-600">T</strong> → RNA <strong className="text-emerald-700">A</strong>
                    <span className="block text-[10px] font-sans text-slate-500">2 Hydrogen Bonds</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 border border-amber-200 font-mono text-center">
                    DNA <strong className="text-emerald-600">A</strong> → RNA <strong className="text-purple-700">U</strong>
                    <span className="block text-[10px] font-sans text-purple-700 font-bold">Uracil, not Thymine!</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 border border-amber-200 font-mono text-center">
                    DNA <strong className="text-sky-600">C</strong> → RNA <strong className="text-amber-700">G</strong>
                    <span className="block text-[10px] font-sans text-slate-500">3 Hydrogen Bonds</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 border border-amber-200 font-mono text-center">
                    DNA <strong className="text-amber-600">G</strong> → RNA <strong className="text-sky-700">C</strong>
                    <span className="block text-[10px] font-sans text-slate-500">3 Hydrogen Bonds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TRANSCRIPTION WORKBENCH: DNA STRAND + CONNECTOR + MRNA SLOTS */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] border border-[#D7E1EC] space-y-4">
          
          {/* Top Label & Polarity */}
          <div className="flex items-center justify-between text-xs font-bold text-[#5B6B7A]">
            <div className="flex items-center space-x-2">
              <Dna size={16} className="text-[#064A8C]" />
              <span className="text-[#14213D] uppercase tracking-wider text-[11px]">
                DNA Template Strand (3′ → 5′)
              </span>
            </div>
            <span className="font-mono text-blue-700 text-xs">
              13 Nucleotides • RNA Polymerase active site
            </span>
          </div>

          {/* Horizontally Scrollable Transcription Track */}
          <div className="overflow-x-auto pb-3 pt-1">
            <div className="min-w-[640px] space-y-3">
              
              {/* Row 1: DNA Template Bases */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-8 text-center text-xs font-mono font-bold text-slate-400 shrink-0">3′</span>
                
                {dnaTemplate.split('').map((dnaBase, idx) => {
                  const style = BASE_STYLES[dnaBase] || BASE_STYLES.A;
                  const isHoveredTarget = dragOverIndex === idx;

                  return (
                    <div
                      key={`dna-${idx}`}
                      className={`relative flex-1 min-w-[38px] max-w-[50px] h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black border transition-all shadow-xs ${style.bg} ${style.text} ${style.border} ${
                        isHoveredTarget ? 'ring-2 ring-blue-400 scale-105' : ''
                      }`}
                      title={`Position ${idx + 1}: DNA Template ${dnaBase} (${style.name})`}
                    >
                      <span className="text-base sm:text-lg leading-none">{dnaBase}</span>
                      <span className="text-[9px] font-sans font-normal text-slate-400 leading-none mt-0.5">
                        {idx + 1}
                      </span>
                    </div>
                  );
                })}

                <span className="w-8 text-center text-xs font-mono font-bold text-slate-400 shrink-0">5′</span>
              </div>

              {/* Row 2: Hydrogen Bonding & RNA Polymerase Connector Lines */}
              <div className="flex items-center gap-1.5 sm:gap-2 py-0.5">
                <span className="w-8 text-center text-[10px] font-mono text-blue-400 shrink-0">H-bonds</span>
                
                {dnaTemplate.split('').map((dnaBase, idx) => {
                  const hasPlaced = slots[idx] !== null;
                  const placedBase = slots[idx];
                  const expected = expectedMrnaArray[idx];
                  const isMatch = hasPlaced && placedBase === expected;

                  return (
                    <div
                      key={`bond-${idx}`}
                      className="flex-1 min-w-[38px] max-w-[50px] flex flex-col items-center justify-center"
                    >
                      {hasPlaced ? (
                        <div className="flex flex-col items-center">
                          {isMatch ? (
                            <div className="flex flex-col items-center space-y-0.5 text-emerald-500 animate-in fade-in">
                              <span className="w-0.5 h-2 bg-emerald-400 rounded-full" />
                              <span className="w-0.5 h-2 bg-emerald-400 rounded-full" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-0.5 text-rose-500">
                              <span className="w-0.5 h-2 bg-rose-400 rounded-full" />
                              <span className="w-0.5 h-2 bg-rose-400 rounded-full" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-0.5 opacity-30 text-slate-400">
                          <span className="w-0.5 h-1.5 bg-slate-300 rounded-full" />
                          <span className="w-0.5 h-1.5 bg-slate-300 rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}

                <span className="w-8 shrink-0" />
              </div>

              {/* Row 3: Droppable mRNA Strand Slots */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-8 text-center text-xs font-mono font-bold text-blue-600 shrink-0">5′</span>
                
                {dnaTemplate.split('').map((_, idx) => {
                  const base = slots[idx];
                  const isOver = dragOverIndex === idx;
                  const validation = validationResults ? validationResults[idx] : null;
                  const style = base ? BASE_STYLES[base] : null;
                  const isCurrentActive = idx === nextEmptySlotIndex && !base;

                  return (
                    <div
                      key={`mrna-slot-${idx}`}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={() => handleDragLeave(idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onClick={() => {
                        if (selectedBaseToPlace) {
                          placeBaseInSlot(idx, selectedBaseToPlace);
                          setSelectedBaseToPlace(null);
                        } else if (base) {
                          handleClearSlot(idx);
                        }
                      }}
                      className={`group relative flex-1 min-w-[38px] max-w-[50px] h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black transition-all cursor-pointer ${
                        base
                          ? `${style.bg} ${style.text} border-2 ${style.border} shadow-sm ${
                              validation
                                ? validation.isCorrect
                                  ? 'ring-2 ring-emerald-500 border-emerald-500'
                                  : 'ring-2 ring-rose-500 border-rose-500 animate-pulse'
                                : ''
                            }`
                          : isOver
                          ? 'border-2 border-dashed border-blue-500 bg-blue-100 ring-4 ring-blue-300/70 scale-105'
                          : isCurrentActive
                          ? 'border-2 border-dashed border-blue-400 bg-white ring-2 ring-blue-200'
                          : 'border-2 border-dashed border-slate-300 bg-white/80 hover:border-blue-300'
                      }`}
                      title={
                        base
                          ? `Position ${idx + 1}: ${base} (${style.name}). Click to remove or drag to reposition.`
                          : `Drop target for position ${idx + 1}`
                      }
                    >
                      {base ? (
                        <>
                          {/* Draggable placed base */}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStartFromSlot(e, base, idx)}
                            onDragEnd={handleDragEnd}
                            className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
                          >
                            <span className="text-base sm:text-lg leading-none">{base}</span>
                            <span className="text-[8px] font-sans font-normal opacity-70 leading-none mt-0.5">
                              {style.name.slice(0, 3)}
                            </span>
                          </div>

                          {/* Hover clear button */}
                          <button
                            onClick={(e) => handleClearSlot(idx, e)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                            title="Remove base"
                          >
                            <X size={10} />
                          </button>

                          {/* Validation Badge */}
                          {validation && (
                            <div className="absolute -bottom-2 inset-x-0 flex justify-center pointer-events-none">
                              {validation.isCorrect ? (
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <Check size={8} className="stroke-[3]" />
                                </span>
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                                  <X size={8} className="stroke-[3]" />
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                          <span className="text-[10px] font-mono text-slate-400">{idx + 1}</span>
                          <span className="text-[8px] font-sans text-slate-400">drop</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <span className="w-8 text-center text-xs font-mono font-bold text-blue-600 shrink-0">3′</span>
              </div>

            </div>
          </div>

          {/* Bottom Progress Bar & Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-semibold text-[#5B6B7A] pt-2 border-t border-blue-100/70 gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#064A8C]">Synthesized mRNA:</span>
              <span className="font-mono tracking-widest bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-[#14213D]">
                5′- {slots.map(s => s || '•').join('')} -3′
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-600">
                {filledSlotsCount} of {dnaTemplate.length} bases placed
              </span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#064A8C] transition-all duration-300"
                  style={{ width: `${(filledSlotsCount / dnaTemplate.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* DRAGGABLE NUCLEOTIDE SUPPLY PALETTE (INFINITE SUPPLY)       */}
        {/* ============================================================ */}
        {simStep <= 2 && (
          <div className="p-5 rounded-2xl bg-[#F0F7FF] border border-blue-200/90 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-sm font-extrabold text-[#14213D] flex items-center space-x-1.5">
                  <GripVertical size={16} className="text-[#064A8C]" />
                  <span>Draggable RNA Nucleotides Supply</span>
                </h3>
                <p className="text-xs text-[#5B6B7A]">
                  Drag any nucleotide tile onto a slot above. (You can also click a tile to instantly place it into the next empty slot).
                </p>
              </div>
              {selectedBaseToPlace && (
                <span className="text-xs font-bold text-[#064A8C] bg-white px-2.5 py-1 rounded-lg border border-blue-300 animate-pulse">
                  Selected: {selectedBaseToPlace} (Click any slot to place)
                </span>
              )}
            </div>

            {/* Draggable Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {RNA_PALETTE.map((base) => {
                const style = BASE_STYLES[base];
                const isSelected = selectedBaseToPlace === base;

                return (
                  <div
                    key={`palette-${base}`}
                    draggable
                    onDragStart={(e) => handleDragStartFromPalette(e, base)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handlePaletteClick(base)}
                    onTouchStart={() => handleTouchStart(base)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 bg-white flex items-center space-x-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group select-none ${
                      isSelected
                        ? 'border-[#064A8C] ring-4 ring-blue-200 scale-102'
                        : `${style.border} hover:border-blue-400`
                    }`}
                  >
                    {/* Visual drag handle */}
                    <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical size={18} />
                    </div>

                    {/* Nucleotide Badge */}
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl shadow-xs transition-transform group-hover:scale-105 ${style.badge}`}>
                      {base}
                    </div>

                    {/* Name & chemical info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#14213D] truncate">{style.name}</h4>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {base === 'U' ? 'Replaces T in RNA' : `Pairs with ${base === 'A' ? 'T/U' : base === 'C' ? 'G' : 'C'}`}
                      </span>
                    </div>

                    {/* Drag indicator pill */}
                    <span className="hidden sm:inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Drag
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: Check, Undo, Reset */}
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCheck}
                  className="px-8 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-sm shadow-lab-button transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>Check Transcription</span>
                </button>

                {filledSlotsCount > 0 && (
                  <button
                    onClick={handleRemoveLast}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Undo Last
                  </button>
                )}
              </div>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Clear all slots"
              >
                <RotateCcw size={14} />
                <span>Reset mRNA</span>
              </button>
            </div>

          </div>
        )}

        {/* Feedback Message Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-start space-x-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : feedback.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-900'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <p className="font-semibold leading-relaxed">{feedback.text}</p>
              {feedback.type === 'success' && simStep < 3 && (
                <button
                  onClick={() => setSimStep(3)}
                  className="mt-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                >
                  <span>Proceed to Translation Stage</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TRANSLATION STAGE: CODON READING FRAME & TRNA DOCKING        */}
        {/* ============================================================ */}
        {simStep >= 3 && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-blue-50/60 to-purple-50/60 border border-emerald-200 shadow-xs space-y-6 animate-in fade-in duration-300">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#14213D] flex items-center space-x-2">
                  <Sparkles size={18} className="text-emerald-600" />
                  <span>Ribosomal Translation & Polypeptide Assembly</span>
                </h3>
                <p className="text-xs text-[#5B6B7A] mt-0.5">
                  The ribosome translates mRNA triplets (codons) into amino acids via matching tRNA anticodons.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shrink-0 self-start sm:self-auto">
                mRNA Transcribed Successfully
              </span>
            </div>

            {/* Codon Triplet Reading Frame with tRNA Pairing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#5B6B7A]">
                <span>Reading Frame (Triplet Codons ➔ tRNA Anticodons):</span>
                <span className="font-mono text-emerald-700">4 Codons Identified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {codons.map((codon, idx) => {
                  const aa = translatedProtein[idx];
                  if (!aa) return null;

                  // Complementary tRNA anticodon (A <-> U, C <-> G)
                  const anticodon = codon.split('').map(b => {
                    if (b === 'A') return 'U';
                    if (b === 'U') return 'A';
                    if (b === 'C') return 'G';
                    if (b === 'G') return 'C';
                    return '?';
                  }).join('');

                  return (
                    <div 
                      key={`codon-card-${idx}`}
                      className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-xs space-y-2 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Codon {idx + 1}</span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                            START
                          </span>
                        )}
                      </div>

                      {/* Codon */}
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/80 text-center font-mono font-black text-sm text-[#064A8C] tracking-widest">
                        {codon}
                      </div>

                      {/* tRNA connector */}
                      <div className="text-center text-[10px] text-slate-400 font-mono">
                        ⇅ tRNA {anticodon}
                      </div>

                      {/* Amino Acid Pill */}
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                        <span className="font-mono font-black text-sm text-emerald-900 block leading-tight">
                          {aa.aa}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 block truncate">
                          {aa.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Translated Amino Acid Chain (Polypeptide) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#5B6B7A] block">
                Primary Polypeptide Chain (Peptide Bond Linked):
              </span>

              <div className="p-4 rounded-2xl bg-white border border-emerald-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 pr-1">N-term</span>
                {translatedProtein.map((aa, idx) => (
                  <React.Fragment key={`polypeptide-${idx}`}>
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-400 shadow-xs flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="font-mono font-black text-sm text-[#14213D] block leading-none">
                          {aa.aa}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-none">
                          {aa.name}
                        </span>
                      </div>
                    </div>
                    {idx < translatedProtein.length - 1 && (
                      <span className="text-xs font-bold text-emerald-600 font-mono">
                        ― (peptide bond) ―
                      </span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-xs font-mono font-bold text-slate-400 pl-1">C-term</span>
              </div>
            </div>

            {/* Educational takeaway callout */}
            <div className="p-4 rounded-xl bg-white/90 border border-blue-200 text-xs text-slate-700 leading-relaxed flex items-start space-x-3">
              <Info size={18} className="text-[#064A8C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#14213D] block mb-0.5">Key Biological Concept:</strong>
                Gene expression is unidirectional from sequence to function. 
                The <strong>template DNA strand (3′→5′)</strong> is transcribed into an antiparallel <strong>mRNA strand (5′→3′)</strong>, which is then read in non-overlapping 3-nucleotide codons by the ribosome to assemble a specific sequence of amino acids.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSimStep(2);
                }}
                className="text-xs font-bold text-[#064A8C] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Return to Drag & Drop mRNA synthesis</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={prevPage}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl border border-[#D7E1EC] bg-white text-[#5B6B7A] hover:text-[#14213D] font-bold text-sm transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3">
          {!isCompleted && (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-600" />
              <span>Complete transcription to unlock Activity 2</span>
            </span>
          )}
          <button
            onClick={nextPage}
            disabled={!isCompleted}
            className={`inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${
              isCompleted
                ? 'bg-[#064A8C] hover:bg-[#085aa8] text-white shadow-lab-button active:scale-95 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
            title={!isCompleted ? 'Complete and verify mRNA transcription to unlock Activity 2' : 'Proceed to Activity 2'}
          >
            {!isCompleted && <Lock size={15} className="text-slate-400" />}
            <span>Activity 2</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Page5Simulation1;
