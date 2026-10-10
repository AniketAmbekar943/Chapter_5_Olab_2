/**
 * Assessment Quiz Questions — All on Page 7 (Single MCQ Section)
 *
 * 10 Questions total.
 * 3-Attempt Hint Policy:
 *  1st wrong  → Hint 1
 *  2nd wrong  → Hint 2
 *  3rd wrong  → Reveal answer + explanation (0 pts)
 *  Correct    → 1 point  (max = 10)
 */

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    page: 7,
    questionNumber: 1,
    question: "Which process involves the synthesis of mRNA using a DNA template?",
    options: [
      "A. Translation",
      "B. Transcription",
      "C. Replication",
      "D. Mutation",
    ],
    correctIndex: 1,
    hints: [
      "Hint 1/3: This process occurs in the nucleus and produces a complementary RNA strand.",
      "Hint 2/3: RNA polymerase is the primary enzyme responsible for synthesising this RNA transcript.",
      "Explanation: Transcription is the enzymatic synthesis of complementary RNA using a DNA template strand.",
    ],
  },
  {
    id: 2,
    page: 7,
    questionNumber: 2,
    question: "Which nitrogenous base is present in RNA instead of Thymine?",
    options: [
      "A. Adenine",
      "B. Cytosine",
      "C. Uracil",
      "D. Guanine",
    ],
    correctIndex: 2,
    hints: [
      "Hint 1/3: Think about the four nitrogenous bases found in ribonucleotides.",
      "Hint 2/3: This pyrimidine base pairs with Adenine in RNA molecules.",
      "Explanation: Uracil (U) replaces Thymine (T) in RNA and pairs with Adenine.",
    ],
  },
  {
    id: 3,
    page: 7,
    questionNumber: 3,
    question: "What is the main difference between a gene and an allele?",
    options: [
      "A. A gene is a chromosome, while an allele is a protein.",
      "B. A gene is a DNA segment, while an allele is an alternative form of that gene.",
      "C. A gene contains amino acids, while an allele contains nucleotides.",
      "D. A gene is found only in RNA.",
    ],
    correctIndex: 1,
    hints: [
      "Hint 1/3: Think about the relationship between a genetic unit and its variations.",
      "Hint 2/3: An allele is one of the alternative versions of a particular gene.",
      "Explanation: A gene is a DNA sequence associated with a functional product; alleles are alternative versions of the same gene.",
    ],
  },
  {
    id: 4,
    page: 7,
    questionNumber: 4,
    question: "Which DNA region commonly helps initiate transcription by providing a binding site for transcription machinery?",
    options: [
      "A. Promoter",
      "B. Codon",
      "C. Peptide bond",
      "D. Anticodon",
    ],
    correctIndex: 0,
    hints: [
      "Hint 1/3: Look for a DNA region associated with starting gene transcription.",
      "Hint 2/3: It is called the promoter.",
      "Explanation: A promoter is a DNA region where transcription machinery assembles to initiate transcription.",
    ],
  },
  {
    id: 5,
    page: 7,
    questionNumber: 5,
    question: "A DNA mutation changes a codon, but the encoded amino acid remains the same. What is this called?",
    options: [
      "A. Nonsense mutation",
      "B. Missense mutation",
      "C. Silent mutation",
      "D. Frameshift mutation",
    ],
    correctIndex: 2,
    hints: [
      "Hint 1/3: The nucleotide sequence changes, but the amino acid does not.",
      "Hint 2/3: The mutation is described as 'silent'.",
      "Explanation: A silent mutation changes a nucleotide without changing the amino acid encoded by the codon.",
    ],
  },
  {
    id: 6,
    page: 7,
    questionNumber: 6,
    question: "Which mutation directly introduces a premature stop codon into a protein-coding sequence?",
    options: [
      "A. Nonsense mutation",
      "B. Silent mutation",
      "C. Neutral substitution",
      "D. Chromosome duplication",
    ],
    correctIndex: 0,
    hints: [
      "Hint 1/3: Consider a mutation that prematurely terminates translation.",
      "Hint 2/3: It is a nonsense mutation.",
      "Explanation: A nonsense mutation converts a codon into a stop codon, potentially shortening the resulting protein.",
    ],
  },
  {
    id: 7,
    page: 7,
    questionNumber: 7,
    question: "Which of the following is an example of a frameshift mutation?",
    options: [
      "A. Substitution of one nucleotide",
      "B. Insertion of one nucleotide",
      "C. Change from A to G",
      "D. Silent mutation",
    ],
    correctIndex: 1,
    hints: [
      "Hint 1/3: Consider which mutation disrupts the three-nucleotide triplet reading frame.",
      "Hint 2/3: Frameshift mutations occur when a nucleotide is inserted or deleted, shifting the reading frame.",
      "Explanation: Insertion or deletion of bases (not divisible by 3) alters every downstream codon.",
    ],
  },
  {
    id: 8,
    page: 7,
    questionNumber: 8,
    question: "Why can a mutation near a gene's regulatory region affect the amount of protein produced without changing its amino-acid sequence?",
    options: [
      "A. It always destroys the chromosome.",
      "B. It can alter how frequently the gene is expressed.",
      "C. It converts all RNA into DNA.",
      "D. It removes every codon from the gene.",
    ],
    correctIndex: 1,
    hints: [
      "Hint 1/3: Not every mutation changes the protein-coding sequence itself.",
      "Hint 2/3: Think about how gene regulation influences the quantity of gene product.",
      "Explanation: Regulatory DNA can influence when and how strongly a gene is expressed, changing protein production levels.",
    ],
  },
  {
    id: 9,
    page: 7,
    questionNumber: 9,
    question: "Which statement best describes a somatic mutation?",
    options: [
      "A. It occurs in a body cell and is generally not inherited by offspring.",
      "B. It always occurs in reproductive cells.",
      "C. It changes every gene in the organism.",
      "D. It always produces a non-functional protein.",
    ],
    correctIndex: 0,
    hints: [
      "Hint 1/3: Distinguish ordinary body cells from cells involved in reproduction.",
      "Hint 2/3: Somatic mutations occur in non-reproductive body cells.",
      "Explanation: Somatic mutations occur in non-reproductive body cells and generally are not passed to offspring.",
    ],
  },
  {
    id: 10,
    page: 7,
    questionNumber: 10,
    question: "Two individuals have different alleles of the same gene. What can this difference potentially cause?",
    options: [
      "A. Every cell to have a different genetic code.",
      "B. Variation in a trait or in the function of a gene product.",
      "C. All proteins to become identical.",
      "D. DNA to stop replicating in every cell.",
    ],
    correctIndex: 1,
    hints: [
      "Hint 1/3: Different versions of a gene can contribute to biological variation.",
      "Hint 2/3: Consider differences in observable traits or gene-product function.",
      "Explanation: Different alleles can contribute to differences in traits or gene-product function, although some alleles have no noticeable effect.",
    ],
  },
];
