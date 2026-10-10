import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, MousePointer, ZoomIn, RotateCcw, Dna, Split, HelpCircle } from 'lucide-react';
import { useLab } from '../../context/LabContext';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to OLAB 2: Genes & Mutations',
    subtitle: 'Interactive Molecular Biology Lab',
    icon: Dna,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <p>
          Welcome to this interactive lab exploration of <strong>Genes, Gene Expression & Mutations</strong>.
        </p>
        <p>
          Throughout this lab, you will journey from intact eukaryotic cells down to individual hydrogen bonds, simulate transcription and translation, test real mutations, and evaluate your knowledge.
        </p>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-[#064A8C] font-medium">
          💡 You can reopen this guide anytime by clicking <strong>How to Use</strong> in the top header.
        </div>
      </div>
    ),
  },
  {
    title: '1. Single-Click for Structure Information',
    subtitle: 'Hierarchical 3D Component Inspection',
    icon: MousePointer,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <p>
          In the <strong>Concept Exploration (Page 4)</strong>, single-clicking or tapping any biological component highlights it without changing the camera zoom.
        </p>
        <p>
          An informative overlay appears displaying the component's biological role, structural composition, and molecular details.
        </p>
        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-[#0F172A]">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          Single Click = Inspect properties & educational notes
        </div>
      </div>
    ),
  },
  {
    title: '2. Double-Click for Nested Zoom Transitions',
    subtitle: 'Drill Down from Cell to Molecular Bonds',
    icon: ZoomIn,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <p>
          <strong>Double-click</strong> or double-tap any gateway structure to smoothly zoom in to the next nested layer in the hierarchy:
        </p>
        <div className="text-xs font-semibold py-2 px-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[#064A8C] space-y-1">
          <div>Cell → Nucleus → Chromosome → DNA → Gene → Base Pair → Molecular Bonds</div>
        </div>
        <p className="text-xs text-slate-500">
          The top breadcrumbs track your depth level at every stage.
        </p>
      </div>
    ),
  },
  {
    title: '3. Navigation & Camera Controls',
    subtitle: 'Back to Previous Level, Reset, & Orbit',
    icon: RotateCcw,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#064A8C]">◄ Back to Previous Level:</span>
            <span>Returns one step upward in the biological hierarchy.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#064A8C]">⟲ Return to Cell:</span>
            <span>Resets the entire 3D viewer directly back to the whole eukaryotic cell.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#064A8C]">🖱 Mouse / Touch:</span>
            <span>Drag to rotate, scroll/pinch to zoom in and out freely.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: '4. Gene Expression Simulator (Simulation 1)',
    subtitle: 'Transcription & Translation Workflow',
    icon: Dna,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <p>
          On Page 5, you will transcribe a given 3′-to-5′ template DNA strand into complementary mRNA:
        </p>
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className="p-1.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">T → A</div>
          <div className="p-1.5 rounded bg-rose-100 text-rose-800 border border-rose-300">A → U</div>
          <div className="p-1.5 rounded bg-sky-100 text-sky-800 border border-sky-300">C → G</div>
          <div className="p-1.5 rounded bg-amber-100 text-amber-800 border border-amber-300">G → C</div>
        </div>
        <p className="text-xs text-slate-500">
          Once complete, observe how mRNA codons are read by the ribosome into an amino-acid polypeptide chain.
        </p>
      </div>
    ),
  },
  {
    title: '5. Mutation Lab (Simulation 2)',
    subtitle: 'Substitution, Insertion, & Deletion',
    icon: Split,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <p>
          On Page 6, experiment with three key types of DNA mutations:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Substitution:</strong> Swap one base with another (Silent, Missense, or Nonsense).</li>
          <li><strong>Insertion:</strong> Insert an extra nucleotide (Frameshift risk).</li>
          <li><strong>Deletion:</strong> Remove a nucleotide (Frameshift risk).</li>
        </ul>
        <p className="text-xs text-slate-500">
          Observe how reading frames shift and how protein primary structure is altered.
        </p>
      </div>
    ),
  },
  {
    title: '6. Assessments & 3-Attempt Hint Policy',
    subtitle: 'Scoring & Educational Guidance',
    icon: HelpCircle,
    content: (
      <div className="space-y-3 text-sm text-[#475569]">
        <p>
          The 10 MCQs in Section 7 follow an interactive 3-attempt guidance policy:
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
            <strong>1st Incorrect:</strong> Unlocks Hint 1 to guide your reasoning.
          </div>
          <div className="p-2 rounded bg-amber-100 border border-amber-300 text-amber-900">
            <strong>2nd Incorrect:</strong> Unlocks a more specific Hint 2.
          </div>
          <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800">
            <strong>3rd Incorrect:</strong> Reveals the correct answer and full explanation (earns 0 pts).
          </div>
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
            <strong>Correct Answer:</strong> Awards 1 point (maximum score: 10/10).
          </div>
        </div>
      </div>
    ),
  },
];

const TutorialModal = () => {
  const { showTutorial, setShowTutorial, dontShowAgain, updateDontShowAgain } = useLab();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!showTutorial) return null;

  const step = TUTORIAL_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleClose = () => {
    setShowTutorial(false);
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#071E3D] to-[#0A2E5C] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <StepIcon size={22} />
            </div>
            <div>
              <h2 id="tutorial-modal-title" className="text-base font-bold text-white tracking-tight">
                {step.title}
              </h2>
              <p className="text-xs text-blue-200/80">{step.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Close guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 pt-4 flex items-center gap-1.5">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i === currentStepIndex
                  ? 'bg-[#064A8C]'
                  : i < currentStepIndex
                  ? 'bg-blue-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step.content}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center space-x-2 text-xs text-slate-600 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => updateDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span>Don't show automatically again</span>
          </label>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#064A8C] hover:bg-[#085aa8] transition-all flex items-center gap-1 shadow-sm active:scale-95"
            >
              {isLast ? (
                <>Finish <Check size={14} /></>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
