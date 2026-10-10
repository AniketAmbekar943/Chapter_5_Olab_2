import React from 'react';
import {
  Target,
  Lightbulb,
  ArrowRight,
  Dna,
  Zap,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import heroImage from '../../assets/hero.png';

/**
 * Section 1: Introduction — Genes, Gene Expression & Mutations
 * Compact, modern scientific landing page.
 * Streamlined vertical height for optimal viewport fit without excessive scrolling.
 */
const Page1Introduction = () => {
  const { nextPage } = useLab();

  const learningObjectives = [
    {
      num: '01',
      title: 'Central Dogma Flow',
      desc: 'Trace information transfer from DNA to mRNA to functional proteins.',
    },
    {
      num: '02',
      title: 'Transcription & Translation',
      desc: 'Simulate RNA Polymerase and ribosomal codon decoding mechanisms.',
    },
    {
      num: '03',
      title: 'Mutation Mechanics',
      desc: 'Induce substitutions, insertions, and deletions at the nucleotide scale.',
    },
    {
      num: '04',
      title: 'Phenotypic Impact',
      desc: 'Evaluate silent, missense, nonsense, and frameshift structural effects.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-5 space-y-4 animate-in fade-in duration-300">

      {/* 1. Compact Cinematic Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#041124] via-[#07244C] to-[#0A3A6B] p-5 sm:p-7 text-white shadow-xl overflow-hidden border border-cyan-500/30">

        {/* Layer 1: Background Image Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src={heroImage}
            alt="DNA and Eukaryotic Cell Background"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#041124]/95 via-[#07244C]/80 to-[#041124]/60" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-600/20 blur-[70px] pointer-events-none" />

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center relative z-10">

          {/* Left Column (8 cols): Title, Subtitle, Highlights, Action */}
          <div className="lg:col-span-8 space-y-4">

            {/* Top Unit Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={13} className="text-cyan-300" />
              <span>Unit 5 • Molecular Genetics Virtual Lab</span>
            </div>

            {/* Main Title */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                Genes, Gene Expression{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-200 bg-clip-text text-transparent">
                  & Mutations
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                Explore how genomic instructions flow from DNA to proteins and discover how nucleotide mutations alter biological structures through interactive 3D simulations.
              </p>
            </div>

            {/* Quick Feature Badges & CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={nextPage}
                className="group relative inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#064A8C] to-[#0A3A6B] hover:from-[#0396E5] hover:to-[#08539C] text-white font-bold text-sm shadow-[0_0_20px_rgba(2,132,199,0.4)] hover:shadow-[0_0_28px_rgba(56,189,248,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/50 cursor-pointer overflow-hidden"
              >
                <span className="relative z-10 tracking-tight">Start LAB</span>
                <ArrowRight size={17} className="relative z-10 group-hover:translate-x-1 transition-transform text-cyan-200" />
              </button>

              <div className="flex items-center space-x-1.5 text-xs text-slate-300/80 font-mono">
                <Clock size={13} className="text-cyan-400" />
                <span>15–20 mins • Self-Paced</span>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-700/70 text-slate-300 text-[11px] font-medium backdrop-blur-md">
                <Dna size={12} className="text-cyan-400" />
                <span>3D Scale Hierarchy</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-700/70 text-slate-300 text-[11px] font-medium backdrop-blur-md">
                <Zap size={12} className="text-amber-400" />
                <span>Dual Simulations</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-700/70 text-slate-300 text-[11px] font-medium backdrop-blur-md">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Knowledge Check</span>
              </span>
            </div>

          </div>

          {/* Right Column (4 cols): Compact Biology Widget */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="w-full max-w-xs rounded-xl bg-slate-900/80 border border-cyan-500/30 shadow-lg p-3.5 backdrop-blur-xl">

              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono uppercase text-slate-300 font-bold">
                    Virtual Lab Active
                  </span>
                </div>
                <span className="font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300 text-[10px]">
                  3D WebGL
                </span>
              </div>

              {/* Compact Hologram Graphic */}
              <div className="py-2.5 flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed animate-[spin_24s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-blue-400/30 animate-[spin_18s_linear_infinite_reverse]" />

                  <svg viewBox="0 0 160 160" className="w-24 h-24 relative z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                    <defs>
                      <linearGradient id="dnaStrandA" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                      <linearGradient id="dnaStrandB" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#C084FC" />
                      </linearGradient>
                    </defs>

                    <line x1="45" y1="40" x2="115" y2="40" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                    <line x1="55" y1="60" x2="105" y2="60" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                    <line x1="40" y1="80" x2="120" y2="80" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                    <line x1="55" y1="100" x2="105" y2="100" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                    <line x1="45" y1="120" x2="115" y2="120" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

                    <path d="M 45 30 Q 30 55 55 80 T 45 130" fill="none" stroke="url(#dnaStrandA)" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 115 30 Q 130 55 105 80 T 115 130" fill="none" stroke="url(#dnaStrandB)" strokeWidth="3.5" strokeLinecap="round" />

                    <circle cx="80" cy="80" r="3.5" fill="#38BDF8" className="animate-pulse" />
                  </svg>
                </div>

                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-cyan-300 font-medium">
                  DNA Duplex & Expression Flow
                </div>
              </div>

              {/* Mini Stats Strip */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800 text-center">
                <div className="p-1 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">Scale</div>
                  <div className="text-[11px] font-bold text-cyan-300 font-mono">2.0 nm</div>
                </div>
                <div className="p-1 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">Flow</div>
                  <div className="text-[11px] font-bold text-sky-300 font-mono">5′ → 3′</div>
                </div>
                <div className="p-1 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">Codons</div>
                  <div className="text-[11px] font-bold text-indigo-300 font-mono">64 Triplets</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. Aim & Learning Objectives — Compact Twin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">

        {/* Left Card (5 cols): Primary Aim */}
        <div className="md:col-span-5 relative rounded-xl bg-white border border-[#D7E1EC] shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-blue-400/60 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#064A8C] to-indigo-600" />

          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#064A8C] to-[#0284C7] text-white flex items-center justify-center shadow-xs shrink-0">
                <Target size={18} className="text-white" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#064A8C] font-bold block">
                  Investigation Focus
                </span>
                <h2 className="text-base font-black text-[#14213D] tracking-tight">
                  Laboratory Aim
                </h2>
              </div>
            </div>

            <p className="text-[#3A4B5A] text-xs sm:text-sm leading-relaxed font-normal">
              Investigate the molecular mechanisms of <strong className="text-[#064A8C] font-semibold">gene expression</strong> (transcription and translation) and systematically evaluate how diverse <strong className="text-blue-900 font-semibold">mutations</strong> alter triplet codons and functional protein structures.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200/60">
              🧬 Central Dogma
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 text-[11px] font-medium border border-cyan-200/60">
              ⚡ Point Mutations
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-medium border border-indigo-200/60">
              🔬 Polypeptides
            </span>
          </div>
        </div>

        {/* Right Card (7 cols): Learning Objectives */}
        <div className="md:col-span-7 relative rounded-xl bg-white border border-[#D7E1EC] shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-blue-400/60 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Lightbulb size={18} className="text-white" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-600 font-bold block">
                  Curriculum Competencies
                </span>
                <h2 className="text-base font-black text-[#14213D] tracking-tight">
                  Learning Objectives
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {learningObjectives.map((obj) => (
                <div
                  key={obj.num}
                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#064A8C] px-1.5 py-0.2 rounded bg-white border border-blue-200 shadow-xs">
                      {obj.num}
                    </span>
                    <h3 className="text-xs font-bold text-[#14213D] leading-tight">
                      {obj.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {obj.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Page1Introduction;
