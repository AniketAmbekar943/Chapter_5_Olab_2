# OLAB 2 — 3D asset package

These are actual glTF 2.0 binary assets, with editable procedural Python sources.
They are scientifically informed teaching models, not experimental atomic structures.

## Files

- `nested_biology_model.glb`: seven scale stages, cell through molecular bonds.
- `gene_expression_scene.glb`: separate transcription and translation stations; five embedded clips.
- `mutation_scene.glb`: selectable DNA nucleotides; four embedded clips.
- `model_hierarchy.json`: exact node/mesh names, structural parents, semantic membership, rest transforms, camera and visibility targets.
- `animation_manifest.json`: only exported clips, durations and exact start/end property states; six external camera transitions.
- `asset_manifest.json`: measured sizes, triangle counts, hashes, meshes and limitations.
- `validation_report.json`: results of independent binary/metadata and Khronos/Three.js validation when available.
- `source/generate_assets.py`: all three assets, reproducible without third-party Python libraries.
- `source/validate_assets.py`: structural, geometric and metadata checks.
- `source/validate_runtime.mjs`: independent Khronos validator and Three.js GLTFLoader check (Node dependencies required).

## Rebuild

From this directory, run `python source/generate_assets.py --output .` with Python 3.10 or later.
Then run `python source/validate_assets.py --output .`.
Generation uses no randomness, external meshes, downloaded textures, Blender or runtime extensions.
To edit in Blender, import any GLB through File > Import > glTF 2.0. A native `.blend` file is not included.
The direct authoring source is the canonical source, not a Blender-only export script.

## Integration contract

Use GLTFLoader to load each file. Mesh and node names are unique within each asset; stable IDs are `filename/node_name`.
Read node `extras` as loader userData. Important components remain separate meshes.
For group selection, recurse through children or use `extras.member_nodes`; aggregate strand/gene groups are empty nodes because glTF permits only one structural parent per node.
Clone a material before per-object highlighting: intentionally shared materials otherwise recolor multiple objects.

For the explorer, initialize **only `stage_cell` visible**. Hide other `stage_*` roots according to the level record.
All stages are spatially separated along X to avoid overlapping selection targets, and all are exported with normal transforms.
The embedded initial camera frames the cell. Generic viewers that frame the entire file will show a row of stages; that is expected.
Apply world-space camera positions and look-at targets from metadata, 38-degree vertical field of view.
Camera framing assumes a viewport at least square; for portrait viewports, fit the visible stage bounds to the smaller dimension.
Camera positions are stage views, not measured microscopy lengths. Object pivot metadata is for rest state.
Do not reset the overall GLB transform or re-center individual stages without transforming the corresponding camera metadata.

Transition IDs connect the educational graph; node parents describe the actual glTF scene graph.
To interrupt a transition, cancel interpolation, use the current camera as the next start, and apply the selected level's visibility policy.
Back navigation reverses the educational edge. Reset restores rest transforms/materials, `stage_cell`, and the cell camera.
An external reveal operation can hide `cell_membrane`, `cytoplasm`, or nuclear-envelope nodes; cutaways already reveal the main structures.

Clips are individual AnimationMixer actions. Run once, clamp at completion, and pause via action/mixer controls.
No playback is automatic. Before a clip, satisfy prerequisites and restore its relevant rest transforms.
Stop conflicting actions before starting a new mutation operation. Mutation clips are alternatives from the same rest state, not cumulative edits.
After stopping a clip, restore the `rest_transform` values from model_hierarchy; stopping an action alone is not a reliable full-scene reset.
Scale-reveal animation uses 0.001 instead of singular zero matrices. Filter tiny spare parts from raycasting.
For repeated mutations or arbitrary sequences, update host sequence state, swap base geometry and complementary bases, and rebuild links as needed.
The supplied substitution demonstrates A-T to G-C and changes two dashed hydrogen contacts to three.
Insertion adds G-C after original index 5; deletion removes original index 5. IDs stay stable instead of being renumbered.
RNA segments and amino-acid visual units deliberately have no fixed codon/residue assignment: the host computes those.

## Geometry, materials and scientific scope

Right-handed DNA uses 10.5 base pairs/turn, rise 0.34 and diameter approximately 2 in stage units before magnification.
Strand A runs 5-prime to 3-prime toward +Y; B is antiparallel. The expression template is B.
Backbone angular offsets create unequal groove widths. A-T has two schematic hydrogen contacts; G-C has three.
Sugars, phosphates, aromatic-ring base meshes, dashed hydrogen contacts and solid backbone links are separately addressable.
Base hues are consistent: A muted olive, T terracotta, G ochre, C slate. Colours convey identity, not natural molecular colour.
All materials use opaque, nonmetallic PBR; no labels, glow, particles, UI, baked lights, images or frontend are included.
Shared geometry buffers reduce size while uniquely named meshes preserve selection. Triangle counts include hidden helpers.
There is no Draco/Meshopt dependency. The host should frustum-cull and explicitly hide inactive stages.
Proteins, amino acids and peptide bonds occur in the expression scene; histones are correctly associated with chromatin.

See the manifest's limitations for the exact simplified and missing structures. A structural validation pass does not certify biological atomic accuracy or visual polish.
Format reference: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
