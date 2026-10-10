/**
 * OLAB 2 — Central Visual Asset Manifest
 * 
 * Note: External GLB models, videos, GIFs, and raster images will be supplied by the user.
 * This manifest centralizes all paths, expected dimensions/formats, mesh mappings, and fallbacks.
 */

export const ASSET_MANIFEST = {
  models: {
    nestedBiology: {
      path: '/assets/olab-2/3d/nested_biology_model.glb',
      format: 'GLB (binary glTF 2.0)',
      description: 'Nested hierarchical molecular biology model (Cell -> Nucleus -> Chromosome -> DNA -> Gene -> Nucleotide -> Bonds)',
      expectedMeshes: [
        { name: 'cell_membrane', level: 'cell', label: 'Cell Membrane & Cytoplasm' },
        { name: 'nucleus_nuclear_envelope', level: 'nucleus', label: 'Cell Nucleus' },
        { name: 'chromatid_core_left', level: 'chromosome', label: 'Condensed Chromosome' },
        { name: 'dna_nucleotide_sugar_a_000', level: 'dna', label: 'DNA Double Helix' },
        { name: 'gene_detail_base_guanine_a_000', level: 'gene', label: 'Gene Coding Sequence' },
        { name: 'nucleotide_detail_base_adenine_a_000', level: 'base_pair', label: 'Complementary Base Pair' },
        { name: 'molecular_detail_base_adenine_a_000', level: 'bonds', label: 'Molecular Hydrogen Bonds' },
      ],
      fallbackComponent: 'NestedHierarchySvgVisualizer',
    },
    geneExpression: {
      path: '/assets/olab-2/3d/gene_expression_scene.glb',
      format: 'GLB (binary glTF 2.0)',
      description: 'Gene expression transcription and translation molecular stations',
    },
    mutationScene: {
      path: '/assets/olab-2/3d/mutation_scene.glb',
      format: 'GLB (binary glTF 2.0)',
      description: 'Mutation experiment station with selectable nucleotide bases',
    },
  },

  animations: {
    centralDogma: {
      path: '/assets/olab-2/animations/central-dogma.svg',
      format: 'Animated SVG or GIF',
      dimensions: '800x450 px',
      description: 'Overview of DNA replication, transcription into mRNA, and translation into protein',
    },
    transcription: {
      path: '/assets/olab-2/animations/transcription.svg',
      format: 'Animated SVG or GIF',
      dimensions: '800x450 px',
      description: 'RNA Polymerase unzipping DNA and synthesizing single-stranded mRNA',
    },
    mutationEffects: {
      path: '/assets/olab-2/animations/mutation-effects.svg',
      format: 'Animated SVG or GIF',
      dimensions: '800x450 px',
      description: 'Comparison of silent, missense, nonsense, and frameshift translation results',
    },
    quickGuideVideo: {
      path: '/assets/olab-2/videos/quick_guide.mp4',
      format: 'MP4 / WebM (15s loop)',
      dimensions: '1280x720 px',
      description: 'Quick 15-second guided simulation walkthrough',
    },
    section3Background: {
      path: '/assets/olab-2/videos/sect_3_background.mp4',
      format: 'MP4',
      description: 'Ambient biological background video for Section 3 3D viewport',
    },
  },

  images: {
    introductionHero: {
      path: '/assets/olab-2/images/[INTRODUCTION_IMAGE].webp',
      format: 'WebP / PNG',
      dimensions: '1024x1024 px (1:1 ratio)',
      description: 'Detailed 3D cutaway of eukaryotic cell with nucleus, ribosomes, and DNA',
    },
    staticModelFallback: {
      path: '/assets/olab-2/images/[STATIC_MODEL_FALLBACK].webp',
      format: 'WebP / PNG',
      dimensions: '1200x800 px',
      description: 'Fallback render of the molecular hierarchy when WebGL is unavailable',
    },
  },
};

export default ASSET_MANIFEST;
