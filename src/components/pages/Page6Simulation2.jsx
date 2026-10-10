import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Repeat, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  Sparkles, 
  Info,
  ArrowRight,
  Lock
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { 
  SIMULATION_2_DEFAULT_DNA, 
  analyzeMutation 
} from '../../data/geneticCode';

const BASE_STYLES = {
  A: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', btn: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  T: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', btn: 'bg-rose-500 hover:bg-rose-600 text-white' },
  C: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300', btn: 'bg-sky-500 hover:bg-sky-600 text-white' },
  G: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
};

const Page6Simulation2 = () => {
  const { prevPage, nextPage, sim2State, setSim2State } = useLab();

  const originalDna = SIMULATION_2_DEFAULT_DNA; // 'ATGCCATTACAGGGG'

  const [mutationType, setMutationType] = useState(sim2State.mutationType || 'substitution');
  const [selectedPos, setSelectedPos] = useState(sim2State.selectedPosition !== undefined ? sim2State.selectedPosition : 4);
  const [newBase, setNewBase] = useState(sim2State.newBase || 'A');
  const [appliedMutation, setAppliedMutation] = useState(sim2State.analysisResult || null);

  // Apply mutation and run real biological analysis
  const handleApply = () => {
    let mutatedDna = '';
    const pos = selectedPos;

    if (mutationType === 'substitution') {
      mutatedDna = originalDna.slice(0, pos) + newBase + originalDna.slice(pos + 1);
    } else if (mutationType === 'insertion') {
      mutatedDna = originalDna.slice(0, pos) + newBase + originalDna.slice(pos);
    } else if (mutationType === 'deletion') {
      mutatedDna = originalDna.slice(0, pos) + originalDna.slice(pos + 1);
    }

    const result = analyzeMutation(originalDna, mutatedDna, mutationType, pos, newBase);
    setAppliedMutation(result);

    setSim2State(prev => ({
      ...prev,
      completed: true,
      mutationType,
      selectedPosition: pos,
      newBase,
      isApplied: true,
      analysisResult: result,
    }));
  };

  const handleReset = () => {
    setMutationType('substitution');
    setSelectedPos(4);
    setNewBase('A');
    setAppliedMutation(null);
    setSim2State(prev => ({
      ...prev,
      completed: false,
      isApplied: false,
      analysisResult: null,
    }));
  };

  const isCompleted = Boolean(appliedMutation || sim2State?.completed);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">
      
      {/* Main Interactive Mutation Stage */}
      <div className="bg-white rounded-2xl border border-[#D7E1EC] shadow-lab-card p-6 sm:p-8 space-y-6">
        
        {/* Activity 2 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#064A8C] border border-blue-200">
                Interactive Mutation Lab
              </span>
              <span className="text-xs text-slate-400 font-medium">Activity 2</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight mt-1">
              Activity 2: DNA Mutation & Biological Impact Analysis
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5B6B7A]">
              Test how substitution, insertion, and deletion alter mRNA codons and whether they result in silent, missense, nonsense, or frameshift effects.
            </p>
          </div>
        </div>

        {/* Step 1: Select Mutation Type Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-[#14213D] uppercase tracking-wider">
            1. Select Mutation Type
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Substitution */}
            <button
              onClick={() => {
                setMutationType('substitution');
                setAppliedMutation(null);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col items-start space-y-2.5 ${
                mutationType === 'substitution'
                  ? 'border-[#064A8C] bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-[#D7E1EC] bg-white hover:border-blue-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#064A8C] flex items-center justify-center">
                <Repeat size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#14213D]">Substitution</h3>
                <p className="text-xs text-[#5B6B7A] mt-0.5">Replace one base with another.</p>
              </div>
            </button>

            {/* Insertion */}
            <button
              onClick={() => {
                setMutationType('insertion');
                setAppliedMutation(null);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col items-start space-y-2.5 ${
                mutationType === 'insertion'
                  ? 'border-[#064A8C] bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-[#D7E1EC] bg-white hover:border-blue-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#14213D]">Insertion</h3>
                <p className="text-xs text-[#5B6B7A] mt-0.5">Add a base to the sequence.</p>
              </div>
            </button>

            {/* Deletion */}
            <button
              onClick={() => {
                setMutationType('deletion');
                setAppliedMutation(null);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col items-start space-y-2.5 ${
                mutationType === 'deletion'
                  ? 'border-[#064A8C] bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-[#D7E1EC] bg-white hover:border-blue-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#14213D]">Deletion</h3>
                <p className="text-xs text-[#5B6B7A] mt-0.5">Remove a base from the sequence.</p>
              </div>
            </button>

          </div>
        </div>

        {/* DNA Sequence & Position Selection matching screenshot */}
        <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E2EBF5] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#5B6B7A]">
            <span>2. Select position to mutate:</span>
            <span className="font-mono text-blue-700">Selected: Position {selectedPos + 1} ({originalDna[selectedPos]})</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
            {originalDna.split('').map((base, idx) => {
              const isSelected = selectedPos === idx;
              const style = BASE_STYLES[base] || BASE_STYLES.A;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPos(idx);
                    setAppliedMutation(null);
                  }}
                  className={`w-9 h-11 sm:w-11 sm:h-12 rounded-xl font-mono font-black text-sm sm:text-base flex flex-col items-center justify-center border transition-all active:scale-95 ${
                    isSelected
                      ? 'border-2 border-rose-600 bg-rose-50 ring-4 ring-rose-200/80 shadow-md scale-105'
                      : `${style.bg} ${style.text} ${style.border} hover:opacity-80 shadow-sm`
                  }`}
                  title={`Position ${idx + 1}: ${base}`}
                >
                  <span className={isSelected ? 'text-rose-700' : ''}>{base}</span>
                  <span className="text-[9px] font-sans font-normal text-slate-400 -mt-1">{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Choose New Base (for Substitution & Insertion) */}
        {mutationType !== 'deletion' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#5B6B7A]">
              3. Choose new base ({mutationType === 'substitution' ? 'replacement' : 'to insert'}):
            </span>
            <div className="flex items-center gap-3">
              {['A', 'T', 'C', 'G'].map((base) => {
                const isSelected = newBase === base;
                const style = BASE_STYLES[base];
                return (
                  <button
                    key={base}
                    onClick={() => {
                      setNewBase(base);
                      setAppliedMutation(null);
                    }}
                    className={`w-12 h-12 rounded-xl font-mono font-black text-lg transition-all active:scale-95 flex items-center justify-center border-2 ${
                      isSelected
                        ? 'border-[#064A8C] ring-4 ring-blue-200 shadow-md scale-105 bg-[#064A8C] text-white'
                        : `${style.bg} ${style.text} ${style.border} hover:scale-105`
                    }`}
                  >
                    {base}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons: Apply Mutation & Reset */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleApply}
            className="px-8 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-sm shadow-lab-button transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Apply Mutation</span>
            <Sparkles size={16} />
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>

        {/* Step 4: Mutation Results & Biological Impact Panel */}
        {appliedMutation && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 border border-blue-200/90 shadow-md space-y-5 animate-in fade-in duration-300">
            
            {/* Header & Classification Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-blue-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Observed Mutation Type</span>
                <h3 className="text-lg font-black text-[#14213D]">{appliedMutation.classification}</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  appliedMutation.impactLevel === 'severe'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : appliedMutation.impactLevel === 'moderate'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                Impact: {appliedMutation.impactLevel.toUpperCase()}
              </span>
            </div>

            {/* Sequence Comparisons (DNA & mRNA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              
              {/* Original */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <span className="font-sans font-bold text-slate-500 block">Original Sequence:</span>
                <div>
                  <span className="text-slate-400 text-[10px] block">DNA:</span>
                  <span className="font-bold text-slate-800 tracking-wider">{appliedMutation.originalDna}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">mRNA:</span>
                  <span className="font-bold text-blue-700 tracking-wider">{appliedMutation.originalMrna}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Protein:</span>
                  <span className="font-bold text-emerald-700 tracking-wider">
                    {appliedMutation.originalProtein.map(p => p.aa).join(' - ') || 'None'}
                  </span>
                </div>
              </div>

              {/* Mutated */}
              <div className="p-3.5 rounded-xl bg-white border border-blue-200 space-y-1.5">
                <span className="font-sans font-bold text-[#064A8C] block">Mutated Sequence:</span>
                <div>
                  <span className="text-slate-400 text-[10px] block">DNA:</span>
                  <span className="font-bold text-rose-700 tracking-wider">{appliedMutation.mutatedDna}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">mRNA:</span>
                  <span className="font-bold text-purple-700 tracking-wider">{appliedMutation.mutatedMrna}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Protein:</span>
                  <span className="font-bold text-indigo-700 tracking-wider">
                    {appliedMutation.mutatedProtein.map(p => p.aa).join(' - ') || 'Truncated / None'}
                  </span>
                </div>
              </div>

            </div>

            {/* Educational Explanation */}
            <div className="p-4 rounded-xl bg-white border border-blue-200/70 text-xs sm:text-sm text-[#475569] leading-relaxed flex items-start space-x-3">
              <Info size={18} className="text-[#064A8C] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#14213D] block mb-1">Biological Analysis:</span>
                <p>{appliedMutation.explanation}</p>
              </div>
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
              <AlertTriangle size={14} className="text-amber-600" />
              <span>Apply a mutation to unlock Quiz</span>
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
            title={!isCompleted ? 'Apply a mutation to proceed to the quiz' : 'Proceed to Quiz'}
          >
            {!isCompleted && <Lock size={15} className="text-slate-400" />}
            <span>Quiz</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Page6Simulation2;
