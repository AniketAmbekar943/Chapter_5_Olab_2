/**
 * Standard Genetic Code and Sequence Utilities
 */

export const CODON_TABLE = {
  // Phenylalanine & Leucine
  'UUU': { aa: 'Phe', name: 'Phenylalanine', type: 'hydrophobic' },
  'UUC': { aa: 'Phe', name: 'Phenylalanine', type: 'hydrophobic' },
  'UUA': { aa: 'Leu', name: 'Leucine', type: 'hydrophobic' },
  'UUG': { aa: 'Leu', name: 'Leucine', type: 'hydrophobic' },

  // Leucine
  'CUU': { aa: 'Leu', name: 'Leucine', type: 'hydrophobic' },
  'CUC': { aa: 'Leu', name: 'Leucine', type: 'hydrophobic' },
  'CUA': { aa: 'Leu', name: 'Leucine', type: 'hydrophobic' },
  'CUG': { aa: 'Leu', name: 'Leucine', type: 'hydrophobic' },

  // Isoleucine & Methionine (Start)
  'AUU': { aa: 'Ile', name: 'Isoleucine', type: 'hydrophobic' },
  'AUC': { aa: 'Ile', name: 'Isoleucine', type: 'hydrophobic' },
  'AUA': { aa: 'Ile', name: 'Isoleucine', type: 'hydrophobic' },
  'AUG': { aa: 'Met', name: 'Methionine (START)', type: 'start' },

  // Valine
  'GUU': { aa: 'Val', name: 'Valine', type: 'hydrophobic' },
  'GUC': { aa: 'Val', name: 'Valine', type: 'hydrophobic' },
  'GUA': { aa: 'Val', name: 'Valine', type: 'hydrophobic' },
  'GUG': { aa: 'Val', name: 'Valine', type: 'hydrophobic' },

  // Serine
  'UCU': { aa: 'Ser', name: 'Serine', type: 'polar' },
  'UCC': { aa: 'Ser', name: 'Serine', type: 'polar' },
  'UCA': { aa: 'Ser', name: 'Serine', type: 'polar' },
  'UCG': { aa: 'Ser', name: 'Serine', type: 'polar' },

  // Proline
  'CCU': { aa: 'Pro', name: 'Proline', type: 'special' },
  'CCC': { aa: 'Pro', name: 'Proline', type: 'special' },
  'CCA': { aa: 'Pro', name: 'Proline', type: 'special' },
  'CCG': { aa: 'Pro', name: 'Proline', type: 'special' },

  // Threonine
  'ACU': { aa: 'Thr', name: 'Threonine', type: 'polar' },
  'ACC': { aa: 'Thr', name: 'Threonine', type: 'polar' },
  'ACA': { aa: 'Thr', name: 'Threonine', type: 'polar' },
  'ACG': { aa: 'Thr', name: 'Threonine', type: 'polar' },

  // Alanine
  'GCU': { aa: 'Ala', name: 'Alanine', type: 'hydrophobic' },
  'GCC': { aa: 'Ala', name: 'Alanine', type: 'hydrophobic' },
  'GCA': { aa: 'Ala', name: 'Alanine', type: 'hydrophobic' },
  'GCG': { aa: 'Ala', name: 'Alanine', type: 'hydrophobic' },

  // Tyrosine & STOP
  'UAU': { aa: 'Tyr', name: 'Tyrosine', type: 'polar' },
  'UAC': { aa: 'Tyr', name: 'Tyrosine', type: 'polar' },
  'UAA': { aa: 'STOP', name: 'Ochre (STOP)', type: 'stop' },
  'UAG': { aa: 'STOP', name: 'Amber (STOP)', type: 'stop' },

  // Histidine & Glutamine
  'CAU': { aa: 'His', name: 'Histidine', type: 'basic' },
  'CAC': { aa: 'His', name: 'Histidine', type: 'basic' },
  'CAA': { aa: 'Gln', name: 'Glutamine', type: 'polar' },
  'CAG': { aa: 'Gln', name: 'Glutamine', type: 'polar' },

  // Asparagine & Lysine
  'AAU': { aa: 'Asn', name: 'Asparagine', type: 'polar' },
  'AAC': { aa: 'Asn', name: 'Asparagine', type: 'polar' },
  'AAA': { aa: 'Lys', name: 'Lysine', type: 'basic' },
  'AAG': { aa: 'Lys', name: 'Lysine', type: 'basic' },

  // Aspartate & Glutamate
  'GAU': { aa: 'Asp', name: 'Aspartic Acid', type: 'acidic' },
  'GAC': { aa: 'Asp', name: 'Aspartic Acid', type: 'acidic' },
  'GAA': { aa: 'Glu', name: 'Glutamic Acid', type: 'acidic' },
  'GAG': { aa: 'Glu', name: 'Glutamic Acid', type: 'acidic' },

  // Cysteine, Tryptophan & STOP
  'UGU': { aa: 'Cys', name: 'Cysteine', type: 'special' },
  'UGC': { aa: 'Cys', name: 'Cysteine', type: 'special' },
  'UGA': { aa: 'STOP', name: 'Opal (STOP)', type: 'stop' },
  'UGG': { aa: 'Trp', name: 'Tryptophan', type: 'hydrophobic' },

  // Arginine
  'CGU': { aa: 'Arg', name: 'Arginine', type: 'basic' },
  'CGC': { aa: 'Arg', name: 'Arginine', type: 'basic' },
  'CGA': { aa: 'Arg', name: 'Arginine', type: 'basic' },
  'CGG': { aa: 'Arg', name: 'Arginine', type: 'basic' },

  // Serine & Arginine
  'AGU': { aa: 'Ser', name: 'Serine', type: 'polar' },
  'AGC': { aa: 'Ser', name: 'Serine', type: 'polar' },
  'AGA': { aa: 'Arg', name: 'Arginine', type: 'basic' },
  'AGG': { aa: 'Arg', name: 'Arginine', type: 'basic' },

  // Glycine
  'GGU': { aa: 'Gly', name: 'Glycine', type: 'special' },
  'GGC': { aa: 'Gly', name: 'Glycine', type: 'special' },
  'GGA': { aa: 'Gly', name: 'Glycine', type: 'special' },
  'GGG': { aa: 'Gly', name: 'Glycine', type: 'special' },
};

/**
 * Base complementary rules:
 * DNA Template (3' -> 5') to mRNA (5' -> 3')
 * T -> A
 * A -> U
 * C -> G
 * G -> C
 */
export const DNA_TO_RNA_COMPLEMENT = {
  'T': 'A',
  'A': 'U',
  'C': 'G',
  'G': 'C',
};

export const DNA_COMPLEMENT = {
  'A': 'T',
  'T': 'A',
  'C': 'G',
  'G': 'C',
};

/**
 * Transcribe DNA template string into mRNA string
 */
export function transcribeDna(dnaStrand) {
  return dnaStrand
    .toUpperCase()
    .split('')
    .map(base => DNA_TO_RNA_COMPLEMENT[base] || '?')
    .join('');
}

/**
 * Group mRNA sequence into 3-letter codons
 */
export function getCodons(mrnaStrand) {
  const codons = [];
  for (let i = 0; i < mrnaStrand.length; i += 3) {
    codons.push(mrnaStrand.slice(i, i + 3));
  }
  return codons;
}

/**
 * Translate mRNA into array of Amino Acids
 */
export function translateMrna(mrnaStrand) {
  const codons = getCodons(mrnaStrand);
  const aminoAcids = [];

  for (let i = 0; i < codons.length; i++) {
    const codon = codons[i];
    if (codon.length === 3) {
      const match = CODON_TABLE[codon];
      if (match) {
        aminoAcids.push({
          codon,
          aa: match.aa,
          name: match.name,
          type: match.type,
          isStop: match.type === 'stop',
          isStart: match.type === 'start',
        });
        if (match.type === 'stop') {
          // Stop translation at first stop codon
          break;
        }
      } else {
        aminoAcids.push({ codon, aa: '???', name: 'Unknown', type: 'unknown' });
      }
    }
  }

  return aminoAcids;
}

/**
 * Predefined DNA Template Strand for Simulation 1 (Matching screenshot):
 * DNA Template (3' -> 5'): T A C C G A T G C C T T A
 * Target mRNA (5' -> 3'):   A U G G C U A C G G A A U
 * Codons: AUG (Met) - GCU (Ala) - ACG (Thr) - GAA (Glu)
 */
export const SIMULATION_1_DEFAULT_DNA = 'TACCGATGCCTTA';

/**
 * Predefined DNA Coding Strand for Simulation 2 (Mutation Lab):
 * 15 bases: ATG CCA TTA CAG GGG
 */
export const SIMULATION_2_DEFAULT_DNA = 'ATGCCATTACAGGGG';

/**
 * Analyze mutation effects between original DNA and mutated DNA
 */
export function analyzeMutation(originalDna, mutatedDna, mutationType, position, newBase) {
  // In simulation 2, we treat the sequence as the coding strand (or transcribe to mRNA: T -> U)
  const originalMrna = originalDna.replace(/T/g, 'U');
  const mutatedMrna = mutatedDna.replace(/T/g, 'U');

  const origAAs = translateMrna(originalMrna);
  const mutAAs = translateMrna(mutatedMrna);

  const origAaString = origAAs.map(a => a.aa).join('-');
  const mutAaString = mutAAs.map(a => a.aa).join('-');

  let classification = '';
  let impactLevel = 'neutral'; // 'benign', 'moderate', 'severe'
  let explanation = '';

  if (mutationType === 'insertion' || mutationType === 'deletion') {
    const diffLen = mutatedDna.length - originalDna.length;
    if (Math.abs(diffLen) % 3 !== 0) {
      classification = 'Frameshift Mutation';
      impactLevel = 'severe';
      explanation = `Inserting or deleting ${Math.abs(diffLen)} base(s) shifts the downstream reading frame. Every subsequent codon is altered, usually resulting in a completely nonfunctional protein or a premature stop codon.`;
    } else {
      classification = 'In-Frame Insertion/Deletion';
      impactLevel = 'moderate';
      explanation = `Added/removed exactly ${Math.abs(diffLen) / 3} codon(s) without altering the downstream reading frame.`;
    }
  } else {
    // Substitution
    if (origAaString === mutAaString) {
      classification = 'Silent Mutation';
      impactLevel = 'benign';
      explanation = `The altered codon still codes for the exact same amino acid due to degeneracy of the genetic code. The resulting protein remains identical in structure and function.`;
    } else {
      const hasPrematureStop = mutAAs.some((a, idx) => a.isStop && (idx < origAAs.length - 1 || origAAs[idx]?.isStop !== true));
      if (hasPrematureStop) {
        classification = 'Nonsense Mutation';
        impactLevel = 'severe';
        explanation = `The single base change converted a coding amino acid codon into a STOP codon, causing premature termination of the polypeptide chain. The truncated protein is typically degraded or non-functional.`;
      } else {
        classification = 'Missense Mutation';
        impactLevel = 'moderate';
        explanation = `The codon now codes for a different amino acid. The phenotypic effect depends on whether the chemical properties (charge, polarity, size) of the new amino acid differ significantly at a critical active site.`;
      }
    }
  }

  return {
    originalDna,
    mutatedDna,
    originalMrna,
    mutatedMrna,
    originalProtein: origAAs,
    mutatedProtein: mutAAs,
    classification,
    impactLevel,
    explanation,
  };
}
