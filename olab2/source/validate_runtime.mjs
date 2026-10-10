// Node 18+. Dependencies are validation-only, never required by the GLB assets.
// Usage: node source/validate_runtime.mjs OUTPUT_DIRECTORY DEPENDENCY_DIRECTORY
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const out=path.resolve(process.argv[2] || '.');
const deps=path.resolve(process.argv[3] || '.');
const require=createRequire(path.join(deps,'package.json'));
const validator=require('gltf-validator');
const THREE=await import(pathToFileURL(path.join(path.dirname(require.resolve('three')),'three.module.js')).href);
const {GLTFLoader}=await import(pathToFileURL(require.resolve('three/addons/loaders/GLTFLoader.js')).href);
const manifest=JSON.parse(fs.readFileSync(path.join(out,'asset_manifest.json'),'utf8'));
const hierarchy=JSON.parse(fs.readFileSync(path.join(out,'model_hierarchy.json'),'utf8'));
const report={validator:'Khronos gltf-validator',validator_version:validator.version(),three_revision:THREE.REVISION,assets:[]};
for(const entry of manifest.assets){
  const bytes=fs.readFileSync(path.join(out,entry.filename));
  const validation=await validator.validateBytes(new Uint8Array(bytes),{uri:entry.filename,maxIssues:100});
  const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'',resolve,reject));
  let meshes=0;const names=new Set();gltf.scene.traverse(n=>{names.add(n.name);if(n.isMesh)meshes++});
  const missing=entry.meshes.filter(n=>!names.has(n));
  if(missing.length)throw new Error('Loader lost mesh names: '+missing.join(','));
  const objects=hierarchy.objects.filter(o=>o.glb===entry.filename);
  const rest=()=>{for(const o of objects){const n=gltf.scene.getObjectByName(o.node_name);if(!n)throw Error('Missing node '+o.node_name);n.position.fromArray(o.rest_transform.translation);n.quaternion.fromArray(o.rest_transform.rotation);n.scale.fromArray(o.rest_transform.scale)}gltf.scene.updateMatrixWorld(true)};
  const clipResults=[];
  for(const clip of gltf.animations){
    rest();const mixer=new THREE.AnimationMixer(gltf.scene);const action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
    mixer.update(clip.duration*.5);const snapshot=clip.tracks.map(t=>{const [name,property]=t.name.split('.');return gltf.scene.getObjectByName(name)[property].toArray()});
    action.paused=true;mixer.update(.2);
    const paused=clip.tracks.every((t,i)=>{const [name,property]=t.name.split('.');return gltf.scene.getObjectByName(name)[property].toArray().every((v,j)=>Math.abs(v-snapshot[i][j])<1e-7)});
    action.paused=false;mixer.update(clip.duration);gltf.scene.updateMatrixWorld(true);
    const finite=[];gltf.scene.traverse(n=>{if(!n.matrixWorld.elements.every(Number.isFinite))finite.push(n.name)});
    const am=JSON.parse(fs.readFileSync(path.join(out,'animation_manifest.json'),'utf8')).clips.find(c=>c.glb===entry.filename&&c.name===clip.name);
    const endState=am.start_end_states.every(s=>{const n=gltf.scene.getObjectByName(s.node_name);const prop={translation:'position',rotation:'quaternion',scale:'scale'}[s.property];return n[prop].toArray().every((v,i)=>Math.abs(v-s.end[i])<2e-5)});
    mixer.stopAllAction();rest();mixer.uncacheRoot(gltf.scene);
    if(!paused||finite.length||!endState)throw Error('Animation failed: '+clip.name);
    clipResults.push({name:clip.name,duration:clip.duration,track_count:clip.tracks.length,pause_verified:paused,endpoint_matches_manifest:endState,reset_verified:true});
  }
  rest();const cameraChecks=[];
  for(const level of hierarchy.levels.filter(l=>l.glb===entry.filename)){
    const node=gltf.scene.getObjectByName(level.root_node);const bounds=new THREE.Box3().setFromObject(node);
    const camera=new THREE.PerspectiveCamera(level.perspective_vertical_fov_degrees,1,level.near,level.far);camera.position.fromArray(level.camera_position);camera.lookAt(new THREE.Vector3().fromArray(level.look_at));camera.updateMatrixWorld();
    let maxNdc=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);maxNdc=Math.max(maxNdc,Math.abs(p.x),Math.abs(p.y));}
    cameraChecks.push({level:level.id,bounds_min:bounds.min.toArray(),bounds_max:bounds.max.toArray(),max_ndc_at_square_aspect:maxNdc,entire_bounding_box_fits:maxNdc<=1});
  }
  const r={filename:entry.filename,khronos_errors:validation.issues.numErrors,khronos_warnings:validation.issues.numWarnings,khronos_infos:validation.issues.numInfos,khronos_messages:validation.issues.messages,loader_success:true,loaded_mesh_count:meshes,all_mesh_names_preserved:missing.length===0,clips:clipResults,cameras:cameraChecks};report.assets.push(r);
  console.log(JSON.stringify({filename:r.filename,errors:r.khronos_errors,warnings:r.khronos_warnings,meshes,clips:clipResults.length,cameras:cameraChecks.map(c=>({level:c.level,fit:c.entire_bounding_box_fits,ndc:c.max_ndc_at_square_aspect}))}));
}
fs.writeFileSync(path.join(out,'runtime_validation.json'),JSON.stringify(report,null,2)+'\n');
if(report.assets.some(a=>a.khronos_errors>0||a.cameras.some(c=>!c.entire_bounding_box_fits)))process.exitCode=1;
