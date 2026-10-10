import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MousePointer, 
  Rotate3d, 
  Sliders, 
  Info, 
  Play, 
  X,
  Sparkles,
  Dna
} from 'lucide-react';
import { useLab } from '../../context/LabContext';

const STEPS = [
  {
    number: 1,
    title: 'Select',
    desc: 'Click on a component to view information. Double-tap to zoom into that component.',
    icon: MousePointer,
    color: 'bg-blue-50 text-[#064A8C] border-blue-200',
  },
  {
    number: 2,
    title: 'Explore',
    desc: 'Use mouse/scroll to rotate and zoom. Navigate using the buttons.',
    icon: Rotate3d,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    number: 3,
    title: 'Interact',
    desc: 'Use the provided controls to perform the activity.',
    icon: Sliders,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    number: 4,
    title: 'Learn',
    desc: 'Click on hints if you are stuck. Follow step-by-step guidance to complete the simulation.',
    icon: Info,
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
];

const Page4HowToUse = () => {
  const { prevPage, nextPage, setShowTutorial } = useLab();
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] tracking-tight">
          Simulation Demo & Controls Guide
        </h1>
        <p className="mt-1 text-sm text-[#5B6B7A]">
          Review these interactive controls and simulation mechanics before exploring the 3D Molecular Explorer and laboratory activities.
        </p>
      </div>

      {/* 4 Guidance Steps Grid matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.number}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D7E1EC] shadow-lab-card flex items-start space-x-4 hover:border-blue-300 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${step.color} shadow-sm group-hover:scale-105 transition-transform`}>
                <StepIcon size={22} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-[#064A8C]">{step.number}</span>
                  <h2 className="text-base font-extrabold text-[#14213D]">{step.title}</h2>
                </div>
                <p className="text-xs sm:text-sm text-[#5B6B7A] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Guide Video / Visual Demonstration Card matching screenshot */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#071E3D] via-[#0B356B] to-[#124B8D] border border-blue-900/60 shadow-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white">
        
        {/* Animated 3D Chromosome & Organelle preview graphic */}
        <div className="relative w-full max-w-md h-44 sm:h-52 flex items-center justify-center">
          
          {/* Background biology animation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <path d="M 20 60 Q 60 10 100 60 T 180 60" fill="none" stroke="#60A5FA" strokeWidth="3" strokeDasharray="4 4" />
              <path d="M 20 60 Q 60 110 100 60 T 180 60" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 4" />
              <circle cx="60" cy="35" r="14" fill="#818CF8" opacity="0.6" />
              <circle cx="140" cy="85" r="16" fill="#F43F5E" opacity="0.6" />
            </svg>
          </div>

          {/* Central Play Button Overlay */}
          <button
            onClick={() => setShowVideoModal(true)}
            className="group relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/90 hover:bg-white text-[#064A8C] flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
            title="Watch quick guide video"
          >
            <Play size={28} className="translate-x-0.5 fill-[#064A8C]" />
            <span className="absolute -inset-2 rounded-full border-2 border-white/40 animate-ping pointer-events-none" />
          </button>
        </div>

        {/* Video trigger label matching screenshot */}
        <button
          onClick={() => setShowVideoModal(true)}
          className="mt-2 inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-blue-200 hover:text-white transition-colors"
        >
          <Play size={14} className="fill-current" />
          <span>Watch a quick guide (15 sec)</span>
        </button>
      </div>

      {/* 15-second Guided Video / Animation Preview Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-[#071E3D] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Play size={16} className="text-cyan-300" />
                <h3 className="font-bold text-sm">Quick Simulation Demonstration (15s)</h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="w-full h-44 rounded-xl bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden border border-slate-800">
                <Dna size={40} className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <p className="mt-3 text-xs font-mono text-cyan-200">
                  Simulation 1: DNA Transcription & Translation
                </p>
                <div className="mt-2 text-[11px] text-slate-400 max-w-xs">
                  Drag and drop complementary RNA bases [A, U, C, G] into mRNA slots. Then observe ribosomal codons translating to functional proteins.
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setShowTutorial(true);
                  }}
                  className="font-bold text-[#064A8C] hover:underline"
                >
                  Open Full Step-by-Step Guide
                </button>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#064A8C] text-white font-bold hover:bg-[#085aa8]"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={prevPage}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl border border-[#D7E1EC] bg-white text-[#5B6B7A] hover:text-[#14213D] font-bold text-sm transition-all"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={nextPage}
          className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-sm shadow-lab-button transition-all duration-150 active:scale-95"
          title="Proceed to Section 4: Concept Exploration"
        >
          <span>Concept Exploration</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default Page4HowToUse;
