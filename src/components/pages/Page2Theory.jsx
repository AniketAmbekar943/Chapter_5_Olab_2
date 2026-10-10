import React, { useState } from 'react';
import { Info, ChevronLeft, ChevronRight, Dna, GitCommit, ArrowRight, BookOpen, Layers, Split } from 'lucide-react';
import { useLab } from '../../context/LabContext';
import chromosomeImg from '../../assets/theory/chromosome.png';
import dnaImg from '../../assets/theory/dna.png';
import geneImg from '../../assets/theory/gene.png';
import proteinImg from '../../assets/theory/protein.png';

const THEORY_TABS = [
  { id: 'genes', label: 'Genes & Alleles' },
  { id: 'central-dogma', label: 'Central Dogma' },
  { id: 'transcription', label: 'Transcription' },
  { id: 'translation', label: 'Translation' },
  { id: 'mutations', label: 'Mutations' },
];

const Page2Theory = () => {
  const { prevPage, nextPage } = useLab();
  const [activeTab, setActiveTab] = useState('genes');

  const currentTabIndex = Math.max(0, THEORY_TABS.findIndex(t => t.id === activeTab));
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === THEORY_TABS.length - 1;

  const handleBack = () => {
    if (isFirstTab) {
      prevPage();
    } else {
      setActiveTab(THEORY_TABS[currentTabIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (isLastTab) {
      nextPage();
    } else {
      setActiveTab(THEORY_TABS[currentTabIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Filter Tabs matching screenshot */}
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-2 scrollbar-none">
        {THEORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#064A8C] text-white shadow-md shadow-blue-900/20'
                  : 'bg-white text-[#5B6B7A] hover:text-[#14213D] border border-[#D7E1EC] hover:border-blue-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Theory Content Card */}
      <div className="bg-white rounded-2xl border border-[#D7E1EC] shadow-lab-card p-6 sm:p-8 space-y-6">
        
        {/* TAB 1: Genes & Alleles */}
        {activeTab === 'genes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                Chromosome → DNA → Gene → Protein
              </h2>
              <p className="mt-2 text-sm text-[#5B6B7A] leading-relaxed max-w-3xl">
                Genes are specific segments of DNA that contain instructions for making functional products, usually proteins. They are packaged tightly into chromosomes within the cell nucleus.
              </p>
            </div>

            {/* Scientific Infographic: Chromosome -> DNA -> Gene -> Protein */}
            <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#D7E1EC] shadow-lab-card space-y-6">
              
              {/* Desktop / Laptop Flow (Horizontal 4-Stage Grid with Centered Connectors) */}
              <div className="hidden lg:grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-2 xl:gap-3">
                
                {/* 1. Chromosome */}
                <div className="flex flex-col rounded-2xl border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/40 via-white to-white p-4 shadow-xs hover:border-purple-300 transition-all hover:shadow-md group">
                  {/* Stage Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                      Stage 01
                    </span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  </div>

                  {/* Image Pedestal with matching purple tint */}
                  <div className="h-40 w-full rounded-xl bg-gradient-to-b from-purple-100/60 via-purple-50/30 to-transparent border border-purple-100 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={chromosomeImg} 
                      alt="Chromosome 3D Structure" 
                      className="max-h-full max-w-full object-contain drop-shadow-md" 
                    />
                  </div>

                  {/* Typography & Details */}
                  <div className="mt-3.5 space-y-1.5 flex-1 flex flex-col justify-between text-center">
                    <div>
                      <h3 className="font-black text-lg text-purple-950 tracking-tight">Chromosome</h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        (contains many genes)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1.5 border-t border-purple-100/70">
                      Long DNA molecule tightly packed with histone proteins into compact structures inside the cell nucleus.
                    </p>
                  </div>
                </div>

                {/* Connector 1: Chromosome -> DNA */}
                <div className="flex flex-col items-center justify-center max-w-[130px] px-1 text-center self-center py-4">
                  <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs space-y-2">
                    <p className="text-[10px] leading-snug text-[#064A8C] font-bold">
                      Chromosomes are made of a long DNA molecule packed with proteins (histones).
                    </p>
                    <div className="flex items-center justify-center text-[#064A8C]">
                      <svg className="w-10 h-4 text-[#064A8C]" viewBox="0 0 40 16" fill="none">
                        <path d="M0 8H34M34 8L26 2M34 8L26 14" stroke="#064A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. DNA */}
                <div className="flex flex-col rounded-2xl border-2 border-sky-200/90 bg-gradient-to-b from-sky-50/40 via-white to-white p-4 shadow-xs hover:border-sky-300 transition-all hover:shadow-md group">
                  {/* Stage Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                      Stage 02
                    </span>
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  </div>

                  {/* Image Pedestal with matching sky tint */}
                  <div className="h-40 w-full rounded-xl bg-gradient-to-b from-sky-100/60 via-sky-50/30 to-transparent border border-sky-100 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={dnaImg} 
                      alt="DNA Double Helix" 
                      className="max-h-full max-w-full object-contain drop-shadow-md" 
                    />
                  </div>

                  {/* Typography & Details */}
                  <div className="mt-3.5 space-y-1.5 flex-1 flex flex-col justify-between text-center">
                    <div>
                      <h3 className="font-black text-lg text-sky-950 tracking-tight">DNA</h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        (double helix)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1.5 border-t border-sky-100/70">
                      Stores genetic information in the sequence of 4 chemical bases (Adenine, Thymine, Guanine, Cytosine).
                    </p>
                  </div>
                </div>

                {/* Connector 2: DNA -> Gene */}
                <div className="flex flex-col items-center justify-center max-w-[130px] px-1 text-center self-center py-4">
                  <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs space-y-2">
                    <p className="text-[10px] leading-snug text-[#064A8C] font-bold">
                      A gene is a specific segment of DNA with a particular nucleotide sequence.
                    </p>
                    <div className="flex items-center justify-center text-[#064A8C]">
                      <svg className="w-10 h-4 text-[#064A8C]" viewBox="0 0 40 16" fill="none">
                        <path d="M0 8H34M34 8L26 2M34 8L26 14" stroke="#064A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. Gene */}
                <div className="flex flex-col rounded-2xl border-2 border-amber-200/90 bg-gradient-to-b from-amber-50/40 via-white to-white p-4 shadow-xs hover:border-amber-300 transition-all hover:shadow-md group">
                  {/* Stage Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      Stage 03
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>

                  {/* Image Pedestal with matching amber tint */}
                  <div className="h-40 w-full rounded-xl bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-transparent border border-amber-100 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <div className="relative inline-flex items-center justify-center h-full">
                      <img 
                        src={geneImg} 
                        alt="Gene segment on DNA helix" 
                        className="max-h-full max-w-full object-contain drop-shadow-md" 
                      />
                      {/* Curly bracket & Gene label */}
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 pointer-events-none">
                        <svg width="10" height="42" viewBox="0 0 10 42" fill="none">
                          <path d="M2 2 H5 Q8 2 8 10 V17 Q8 21 10 21 Q8 21 8 25 V32 Q8 40 5 40 H2" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        </svg>
                        <span className="text-[11px] font-black text-amber-700 tracking-tight pl-0.5 bg-amber-100/90 px-1 py-0.5 rounded border border-amber-300">
                          Gene
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Typography & Details */}
                  <div className="mt-3.5 space-y-1.5 flex-1 flex flex-col justify-between text-center">
                    <div>
                      <h3 className="font-black text-lg text-amber-950 tracking-tight">Gene</h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        (segment of DNA)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1.5 border-t border-amber-100/70">
                      Contains the instructions for making a functional product, usually a protein or a functional RNA.
                    </p>
                  </div>
                </div>

                {/* Connector 3: Gene -> Protein */}
                <div className="flex flex-col items-center justify-center max-w-[130px] px-1 text-center self-center py-4">
                  <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs space-y-2">
                    <p className="text-[10px] leading-snug text-[#064A8C] font-bold">
                      The information in a gene is used to make a functional product.
                    </p>
                    <div className="flex items-center justify-center text-[#064A8C]">
                      <svg className="w-10 h-4 text-[#064A8C]" viewBox="0 0 40 16" fill="none">
                        <path d="M0 8H34M34 8L26 2M34 8L26 14" stroke="#064A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 4. Protein */}
                <div className="flex flex-col rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/40 via-white to-white p-4 shadow-xs hover:border-emerald-300 transition-all hover:shadow-md group">
                  {/* Stage Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Stage 04
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Image Pedestal with matching emerald tint */}
                  <div className="h-40 w-full rounded-xl bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-transparent border border-emerald-100 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={proteinImg} 
                      alt="Folded Protein 3D Molecular Complex" 
                      className="max-h-full max-w-full object-contain drop-shadow-md" 
                    />
                  </div>

                  {/* Typography & Details */}
                  <div className="mt-3.5 space-y-1.5 flex-1 flex flex-col justify-between text-center">
                    <div>
                      <h3 className="font-black text-lg text-emerald-950 tracking-tight">Protein</h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        (functional product)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1.5 border-t border-emerald-100/70">
                      A chain of amino acids that folds into a specific 3D shape and performs a vital biological function in the cell.
                    </p>
                  </div>
                </div>

              </div>

              {/* Tablet & Mobile View (Responsive Card Sequence with Connecting Pills) */}
              <div className="lg:hidden flex flex-col space-y-4">
                
                {/* 1. Chromosome */}
                <div className="rounded-2xl border-2 border-purple-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-32 rounded-xl bg-purple-50/80 border border-purple-100 shrink-0 flex items-center justify-center p-2">
                    <img src={chromosomeImg} alt="Chromosome" className="max-h-full max-w-full object-contain drop-shadow-md" />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                      Stage 01
                    </span>
                    <h3 className="font-extrabold text-base text-purple-950">Chromosome</h3>
                    <p className="text-xs text-purple-700 font-medium">(contains many genes)</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Long DNA molecule tightly packed with histone proteins into compact structures inside the cell nucleus.
                    </p>
                  </div>
                </div>

                {/* Mobile Connector 1 */}
                <div className="flex flex-col items-center text-center px-4 py-1">
                  <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#064A8C] text-xs font-semibold max-w-sm mb-1.5">
                    Chromosomes are made of a long DNA molecule packed with proteins (histones).
                  </div>
                  <svg className="w-4 h-5 text-[#064A8C]" viewBox="0 0 16 20" fill="none">
                    <path d="M8 0V15M8 15L3 10M8 15L13 10" stroke="#064A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* 2. DNA */}
                <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-32 rounded-xl bg-sky-50/80 border border-sky-100 shrink-0 flex items-center justify-center p-2">
                    <img src={dnaImg} alt="DNA" className="max-h-full max-w-full object-contain drop-shadow-md" />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                      Stage 02
                    </span>
                    <h3 className="font-extrabold text-base text-sky-950">DNA</h3>
                    <p className="text-xs text-sky-700 font-medium">(double helix)</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Stores genetic information in the sequence of 4 chemical bases (Adenine, Thymine, Guanine, Cytosine).
                    </p>
                  </div>
                </div>

                {/* Mobile Connector 2 */}
                <div className="flex flex-col items-center text-center px-4 py-1">
                  <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#064A8C] text-xs font-semibold max-w-sm mb-1.5">
                    A gene is a specific segment of DNA with a particular nucleotide sequence.
                  </div>
                  <svg className="w-4 h-5 text-[#064A8C]" viewBox="0 0 16 20" fill="none">
                    <path d="M8 0V15M8 15L3 10M8 15L13 10" stroke="#064A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* 3. Gene */}
                <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-32 rounded-xl bg-amber-50/80 border border-amber-100 shrink-0 flex items-center justify-center p-2 relative">
                    <img src={geneImg} alt="Gene" className="max-h-full max-w-full object-contain drop-shadow-md" />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-800 bg-amber-100 px-1 py-0.5 rounded border border-amber-300">
                      Gene
                    </span>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      Stage 03
                    </span>
                    <h3 className="font-extrabold text-base text-amber-950">Gene</h3>
                    <p className="text-xs text-amber-800 font-medium">(segment of DNA)</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Contains the instructions for making a functional product, usually a protein or a functional RNA.
                    </p>
                  </div>
                </div>

                {/* Mobile Connector 3 */}
                <div className="flex flex-col items-center text-center px-4 py-1">
                  <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#064A8C] text-xs font-semibold max-w-sm mb-1.5">
                    The information in a gene is used to make a functional product.
                  </div>
                  <svg className="w-4 h-5 text-[#064A8C]" viewBox="0 0 16 20" fill="none">
                    <path d="M8 0V15M8 15L3 10M8 15L13 10" stroke="#064A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* 4. Protein */}
                <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-32 rounded-xl bg-emerald-50/80 border border-emerald-100 shrink-0 flex items-center justify-center p-2">
                    <img src={proteinImg} alt="Protein" className="max-h-full max-w-full object-contain drop-shadow-md" />
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Stage 04
                    </span>
                    <h3 className="font-extrabold text-base text-emerald-950">Protein</h3>
                    <p className="text-xs text-emerald-800 font-medium">(functional product)</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      A chain of amino acids that folds into a specific 3D shape and performs a vital biological function in the cell.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Callout matching specification */}
            <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#064A8C]/20 flex items-start space-x-3 text-xs sm:text-sm text-[#064A8C]">
              <div className="w-6 h-6 rounded-full bg-[#064A8C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <p className="font-medium leading-relaxed">
                A gene is a specific segment of DNA that can encode a protein or functional RNA.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Central Dogma */}
        {activeTab === 'central-dogma' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                The Central Dogma of Molecular Biology
              </h2>
              <p className="mt-2 text-sm text-[#5B6B7A] leading-relaxed max-w-3xl">
                Formulated by Francis Crick in 1958, the central dogma explains the unidirectional flow of genetic information inside biological systems: DNA directs the synthesis of RNA, which in turn directs the synthesis of functional proteins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col items-center text-center space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold font-mono">1. DNA</span>
                <h3 className="font-bold text-[#14213D] text-sm">Genomic Storage</h3>
                <p className="text-xs text-[#5B6B7A]">Double-stranded master template protected inside the cell nucleus.</p>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex flex-col items-center text-center space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-cyan-600 text-white text-xs font-bold font-mono">2. mRNA</span>
                <h3 className="font-bold text-[#14213D] text-sm">Transient Messenger</h3>
                <p className="text-xs text-[#5B6B7A]">Single-stranded ribonucleic acid transcript synthesized by RNA Polymerase.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center text-center space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono">3. Protein</span>
                <h3 className="font-bold text-[#14213D] text-sm">Functional Product</h3>
                <p className="text-xs text-[#5B6B7A]">Polypeptide chains folded into structural proteins, antibodies, and enzymes.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#064A8C]/20 flex items-start space-x-3 text-xs sm:text-sm text-[#064A8C]">
              <div className="w-6 h-6 rounded-full bg-[#064A8C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <p className="font-medium leading-relaxed">
                Summary: DNA (Replication) → RNA (Transcription) → Protein (Translation).
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Transcription */}
        {activeTab === 'transcription' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                Transcription: Synthesizing mRNA
              </h2>
              <p className="mt-2 text-sm text-[#5B6B7A] leading-relaxed max-w-3xl">
                Transcription takes place inside the nucleus. RNA Polymerase binds to the promoter sequence of a gene, unwinds the DNA double helix, and transcribes the template strand (3′ to 5′) into a complementary mRNA strand (5′ to 3′).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-[#14213D]">RNA Complementary Base Pairing Rules:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
                <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">DNA T → RNA A</div>
                <div className="p-3 rounded-lg bg-rose-100 text-rose-900 border border-rose-300">DNA A → RNA U</div>
                <div className="p-3 rounded-lg bg-sky-100 text-sky-900 border border-sky-300">DNA C → RNA G</div>
                <div className="p-3 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">DNA G → RNA C</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#064A8C]/20 flex items-start space-x-3 text-xs sm:text-sm text-[#064A8C]">
              <div className="w-6 h-6 rounded-full bg-[#064A8C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <p className="font-medium leading-relaxed">
                Key distinction: RNA contains Uracil (U) instead of Thymine (T). Uracil pairs with Adenine.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: Translation */}
        {activeTab === 'translation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                Translation: Reading Codons into Proteins
              </h2>
              <p className="mt-2 text-sm text-[#5B6B7A] leading-relaxed max-w-3xl">
                The mature mRNA moves into the cytoplasm and docks onto a ribosome. The ribosome reads the mRNA in non-overlapping groups of three nucleotides called <strong>codons</strong>. Transfer RNA (tRNA) molecules bring matching amino acids to build the growing polypeptide.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-bold text-[#064A8C]">Start Codon:</span>
                <p className="text-[#5B6B7A]"><strong>AUG</strong> signals the ribosome to start translation and encodes the first amino acid: Methionine (Met).</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="font-bold text-rose-700">Stop Codons:</span>
                <p className="text-[#5B6B7A]"><strong>UAA, UAG, and UGA</strong> do not code for amino acids; they bind release factors that terminate translation.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#064A8C]/20 flex items-start space-x-3 text-xs sm:text-sm text-[#064A8C]">
              <div className="w-6 h-6 rounded-full bg-[#064A8C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <p className="font-medium leading-relaxed">
                64 possible codons encode 20 standard amino acids, making the genetic code degenerate (redundant).
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: Mutations */}
        {activeTab === 'mutations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                Types & Biological Effects of Mutations
              </h2>
              <p className="mt-2 text-sm text-[#5B6B7A] leading-relaxed max-w-3xl">
                Mutations are permanent alterations in the nucleotide sequence of DNA. They can occur spontaneously during replication or from environmental mutagens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#14213D]">1. Silent Mutation:</span>
                <p className="text-[#5B6B7A]">A nucleotide changes, but the new codon encodes the same amino acid. No effect on the final protein.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900">2. Missense Mutation:</span>
                <p className="text-amber-800">A nucleotide change switches one amino acid for another. May alter enzyme activity or folding.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="font-bold text-rose-900">3. Nonsense Mutation:</span>
                <p className="text-rose-800">A codon changes into a premature STOP codon, truncating the polypeptide chain.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="font-bold text-purple-900">4. Frameshift Mutation:</span>
                <p className="text-purple-800">Insertion or deletion of bases (not divisible by 3) shifts the entire downstream reading frame.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#064A8C]/20 flex items-start space-x-3 text-xs sm:text-sm text-[#064A8C]">
              <div className="w-6 h-6 rounded-full bg-[#064A8C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <p className="font-medium leading-relaxed">
                You will test each of these mutations directly in Simulation 2 (Mutation Lab).
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl border border-[#D7E1EC] bg-white text-[#5B6B7A] hover:text-[#14213D] hover:border-blue-300 font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-95"
          title={isFirstTab ? 'Back to Introduction' : `Previous: ${THEORY_TABS[currentTabIndex - 1]?.label}`}
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-sm shadow-lab-button transition-all duration-150 active:scale-95 cursor-pointer"
          title={isLastTab ? 'Proceed to Section 3: Simulation Demo' : `Next: ${THEORY_TABS[currentTabIndex + 1]?.label}`}
        >
          <span>{isLastTab ? 'Simulation Demo' : 'Next'}</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default Page2Theory;
