import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCcw, ZoomIn, ZoomOut, Tag, Maximize2, Loader2, AlertCircle } from 'lucide-react';
import { ASSET_MANIFEST } from '../../data/assetManifest';
import { HIERARCHY_LEVELS, getHierarchyLevel } from '../../data/hierarchyData';

/**
 * Nested3DViewer Component
 * Interactive Three.js viewer for nested biological models (Cell -> Nucleus -> Chromosome -> DNA -> Gene -> Nucleotide -> Bonds).
 * Features:
 * - Direct 3D mesh raycast selection with subtle visual highlight
 * - Level-specific callout labels with SVG leader lines and target anchor dots
 * - Collision avoidance to prevent label overlap
 * - Level-synchronized cleanup when changing hierarchy stages
 * - Accurately framed camera transitions that prevent clipping
 * - Seamless looping background video
 */
const Nested3DViewer = ({
  currentLevelId,
  selectedComponent,
  onSelectComponent,
  onDrillDown,
  isAutoPlaying = false,
  isPaused = false,
  onTransitionComplete,
  showLabels = true,
  onToggleLabels,
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const reqFrameRef = useRef(null);
  const gltfSceneRef = useRef(null);
  const stageRootsRef = useRef({});
  const activeMeshHighlightRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [projectedLabels, setProjectedLabels] = useState([]);

  // Synchronization refs to avoid stale closure traps in animation loop
  const currentLevelIdRef = useRef(currentLevelId);
  currentLevelIdRef.current = currentLevelId;
  useEffect(() => {
    currentLevelIdRef.current = currentLevelId;
  }, [currentLevelId]);

  const showLabelsRef = useRef(showLabels);
  showLabelsRef.current = showLabels;
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);

  const projectedLabelsRef = useRef([]);

  // Transition & interaction state
  const transitionRef = useRef(null);
  const clickTimerRef = useRef(null);
  const videoRef = useRef(null);

  // Background Video Autoplay Controller
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    video.load();
    tryPlay();

    const handleEnded = () => {
      video.currentTime = 0;
      tryPlay();
    };
    video.addEventListener('ended', handleEnded);

    const handleUserInteract = () => {
      if (video.paused) tryPlay();
    };
    window.addEventListener('click', handleUserInteract, { once: true, passive: true });
    window.addEventListener('touchstart', handleUserInteract, { once: true, passive: true });

    return () => {
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('click', handleUserInteract);
      window.removeEventListener('touchstart', handleUserInteract);
    };
  }, []);

  const currentLevel = getHierarchyLevel(currentLevelId);

  // 1. Initialize Three.js Scene, Camera, Controls, Lights
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Aspect-ratio-adaptive perspective camera
    const aspect = width / height;
    const baseFov = currentLevel.camera.fov || 38;
    const effectiveFov = aspect < 1.4 ? baseFov * (1.4 / Math.max(0.7, aspect)) : baseFov;

    const camera = new THREE.PerspectiveCamera(effectiveFov, aspect, 0.1, 500);
    camera.position.set(...currentLevel.camera.position);
    camera.lookAt(...currentLevel.camera.target);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(...currentLevel.camera.target);
    controls.maxDistance = 45;
    controls.minDistance = 2.5;
    controlsRef.current = controls;

    // Rich biological lighting setup
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.7);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(15, 25, 20);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-20, 10, -15);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 1.2);
    rimLight.position.set(8, -16, 12);
    scene.add(rimLight);

    const frontFill = new THREE.DirectionalLight(0xdbeafe, 0.9);
    frontFill.position.set(0, 5, 22);
    scene.add(frontFill);

    // Load Model
    const glbUrl = ASSET_MANIFEST.models.nestedBiology.path;
    const loader = new GLTFLoader();

    let isDisposed = false;

    loader.load(
      glbUrl,
      (gltf) => {
        if (isDisposed) return;
        gltfSceneRef.current = gltf.scene;

        const stageRoots = {};
        gltf.scene.traverse((child) => {
          if (child.name && child.name.startsWith('stage_')) {
            stageRoots[child.name] = child;
          }
          if (child.isMesh && child.material) {
            child.castShadow = false;
            child.receiveShadow = false;

            // Translucent membranes and biological materials
            if (child.name === 'cell_membrane') {
              child.material = child.material.clone();
              child.material.transparent = true;
              child.material.opacity = 0.55;
              child.material.roughness = 0.18;
              child.material.metalness = 0.12;
            } else if (child.name === 'cytoplasm') {
              child.material = child.material.clone();
              child.material.transparent = true;
              child.material.opacity = 0.14;
            } else if (child.name.includes('crista')) {
              child.material = child.material.clone();
              child.material.emissive = new THREE.Color('#7c2d12');
              child.material.emissiveIntensity = 0.45;
              child.material.roughness = 0.22;
            } else if (child.name.includes('hydrogen_bond')) {
              child.material = child.material.clone();
              child.material.emissive = new THREE.Color('#0284c7');
              child.material.emissiveIntensity = 0.55;
              child.material.roughness = 0.2;
            } else {
              child.material.roughness = Math.min(0.32, child.material.roughness || 0.32);
              child.material.metalness = Math.max(0.08, child.material.metalness || 0.08);
            }
          }
        });
        stageRootsRef.current = stageRoots;

        // Apply initial stage visibility strictly for active model
        HIERARCHY_LEVELS.forEach((lvl) => {
          const root = stageRoots[lvl.rootNode];
          if (root) {
            root.visible = lvl.id === currentLevelIdRef.current;
          }
        });

        scene.add(gltf.scene);
        setModelLoaded(true);
        setLoading(false);
      },
      undefined,
      (err) => {
        if (isDisposed) return;
        console.warn('Failed to load nested biology GLB:', err);
        setLoadError('3D model loading was interrupted or unavailable.');
        setLoading(false);
      }
    );

    // Animation & Continuous Annotation Calculation Loop
    let animationId;
    const animate = (time) => {
      animationId = requestAnimationFrame(animate);

      // Camera transition interpolation
      let inTransition = false;
      if (transitionRef.current && !transitionRef.current.paused) {
        inTransition = true;
        const tr = transitionRef.current;
        const elapsed = (time - tr.startTime) / tr.duration;
        const t = Math.min(1, Math.max(0, elapsed));
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(tr.startPos, tr.endPos, ease);
        controls.target.lerpVectors(tr.startTarget, tr.endTarget, ease);
        controls.update();

        if (t >= 1) {
          transitionRef.current = null;
          inTransition = false;
          if (tr.onComplete) tr.onComplete();
        }
      } else {
        controls.update();
      }

      renderer.render(scene, camera);

      // CRITICAL: Suppress labels during inter-model transitions so labels never float or interfere between models!
      if (inTransition) {
        if (projectedLabelsRef.current.length > 0) {
          projectedLabelsRef.current = [];
          setProjectedLabels([]);
        }
        return;
      }

      // Project 3D callouts strictly for the active biological model
      const activeLvl = getHierarchyLevel(currentLevelIdRef.current);
      if (activeLvl && activeLvl.callouts && container && showLabelsRef.current) {
        const rect = container.getBoundingClientRect();
        const rawLabels = [];

        activeLvl.callouts.forEach((c) => {
          const worldPos = new THREE.Vector3(...c.position);
          const screenPos = worldPos.clone().project(camera);

          // Accurate view frustum check: in front of camera (z in [-1, 1]) and within viewport margins
          const isVisible = screenPos.z > -1 && screenPos.z <= 1.0 && Math.abs(screenPos.x) <= 1.25 && Math.abs(screenPos.y) <= 1.25;
          if (!isVisible) return;

          const anchorX = Math.round((screenPos.x * 0.5 + 0.5) * rect.width);
          const anchorY = Math.round((-(screenPos.y * 0.5) + 0.5) * rect.height);

          const rawDx = c.offset?.dx || 0;
          const rawDy = c.offset?.dy || -35;
          const rawDist = Math.hypot(rawDx, rawDy) || 1;

          // Proportional, compact distance (34px to 48px) so arrows stay tight and properly aligned to target
          const targetDist = Math.min(48, Math.max(34, rawDist * 0.55));
          const offsetX = Math.round((rawDx / rawDist) * targetDist);
          const offsetY = Math.round((rawDy / rawDist) * targetDist);

          let labelX = anchorX + offsetX;
          let labelY = anchorY + offsetY;

          // Clamp label within container bounds with safe margins
          labelX = Math.max(75, Math.min(rect.width - 75, labelX));
          labelY = Math.max(30, Math.min(rect.height - 30, labelY));

          rawLabels.push({
            ...c,
            levelId: activeLvl.id,
            anchorX,
            anchorY,
            labelX,
            labelY,
            isVisible: true,
          });
        });

        // Collision avoidance pass: separate overlapping labels vertically
        for (let iter = 0; iter < 3; iter++) {
          for (let i = 0; i < rawLabels.length; i++) {
            for (let j = i + 1; j < rawLabels.length; j++) {
              const l1 = rawLabels[i];
              const l2 = rawLabels[j];
              const dx = Math.abs(l1.labelX - l2.labelX);
              const dy = Math.abs(l1.labelY - l2.labelY);

              if (dx < 105 && dy < 32) {
                const shift = (32 - dy) / 2;
                if (l1.labelY < l2.labelY) {
                  l1.labelY = Math.max(30, l1.labelY - shift);
                  l2.labelY = Math.min(rect.height - 30, l2.labelY + shift);
                } else {
                  l1.labelY = Math.min(rect.height - 30, l1.labelY + shift);
                  l2.labelY = Math.max(30, l2.labelY - shift);
                }
              }
            }
          }
        }

        projectedLabelsRef.current = rawLabels;
        setProjectedLabels(rawLabels);
      } else {
        if (projectedLabelsRef.current.length > 0) {
          projectedLabelsRef.current = [];
          setProjectedLabels([]);
        }
      }
    };

    animationId = requestAnimationFrame(animate);
    reqFrameRef.current = animationId;

    // Window Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const newAspect = w / h;
      camera.aspect = newAspect;
      camera.fov = newAspect < 1.4 ? 38 * (1.4 / Math.max(0.7, newAspect)) : 38;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (renderer && renderer.domElement && container) {
        container.innerHTML = '';
        renderer.dispose();
      }
    };
  }, []);

  // 2. Camera Smooth Transition & Label Cleanup on currentLevelId change
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const stageRoots = stageRootsRef.current;
    if (!camera || !controls) return;

    const targetLevel = getHierarchyLevel(currentLevelId);
    if (!targetLevel) return;

    // Immediately clear stale labels from previous view
    setProjectedLabels([]);
    if (projectedLabelsRef.current) projectedLabelsRef.current = [];

    // Clear active mesh highlight
    if (activeMeshHighlightRef.current) {
      const prev = activeMeshHighlightRef.current;
      if (prev.mesh && prev.originalEmissive && prev.mesh.material) {
        prev.mesh.material.emissive = prev.originalEmissive;
        prev.mesh.material.emissiveIntensity = prev.originalIntensity;
      }
      activeMeshHighlightRef.current = null;
    }

    // Isolate stage models: only source and destination models are visible during travel
    HIERARCHY_LEVELS.forEach((lvl) => {
      const root = stageRoots[lvl.rootNode];
      if (root) {
        root.visible = lvl.id === targetLevel.id || lvl.id === currentLevelIdRef.current;
      }
    });

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos = new THREE.Vector3(...targetLevel.camera.position);
    const endTarget = new THREE.Vector3(...targetLevel.camera.target);

    // Cancel existing transition
    if (transitionRef.current) {
      transitionRef.current = null;
    }

    const duration = isAutoPlaying ? 1100 : 900;

    transitionRef.current = {
      startTime: performance.now(),
      duration,
      startPos,
      endPos,
      startTarget,
      endTarget,
      paused: isPaused,
      onComplete: () => {
        // Once arrived at destination stage, ensure ONLY active stage model is visible
        HIERARCHY_LEVELS.forEach((lvl) => {
          const root = stageRoots[lvl.rootNode];
          if (root) {
            root.visible = lvl.id === targetLevel.id;
          }
        });

        if (onTransitionComplete) {
          onTransitionComplete(targetLevel.id);
        }
      },
    };
  }, [currentLevelId, isAutoPlaying, onTransitionComplete]);

  // 3. Pause/Resume handling for camera transition
  useEffect(() => {
    if (transitionRef.current) {
      transitionRef.current.paused = isPaused;
    }
  }, [isPaused]);

  // 4. Subtle Mesh Highlighting Helper
  const highlightMesh = useCallback((mesh) => {
    if (!mesh || !mesh.material) return;

    // Restore previous mesh
    if (activeMeshHighlightRef.current) {
      const prev = activeMeshHighlightRef.current;
      if (prev.mesh && prev.originalEmissive && prev.mesh.material) {
        prev.mesh.material.emissive = prev.originalEmissive;
        prev.mesh.material.emissiveIntensity = prev.originalIntensity;
      }
      activeMeshHighlightRef.current = null;
    }

    // Clone material if needed so other instances aren't modified
    if (!mesh.material.userData?.isClonedForHighlight) {
      mesh.material = mesh.material.clone();
      mesh.material.userData.isClonedForHighlight = true;
    }

    const originalEmissive = mesh.material.emissive ? mesh.material.emissive.clone() : new THREE.Color(0x000000);
    const originalIntensity = mesh.material.emissiveIntensity || 0;

    mesh.material.emissive = new THREE.Color('#38bdf8');
    mesh.material.emissiveIntensity = 0.55;

    activeMeshHighlightRef.current = {
      mesh,
      originalEmissive,
      originalIntensity,
    };
  }, []);

  // 5. Viewport Toolbar Actions
  const handleResetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetLevel = getHierarchyLevel(currentLevelId);
    camera.position.set(...targetLevel.camera.position);
    controls.target.set(...targetLevel.camera.target);
    controls.update();
  }, [currentLevelId]);

  const handleZoomIn = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
    camera.position.addScaledVector(dir, 0.18);
    controls.update();
  }, []);

  const handleZoomOut = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    camera.position.addScaledVector(dir, 0.18);
    controls.update();
  }, []);

  const handleFitToView = useCallback(() => {
    handleResetView();
  }, [handleResetView]);

  // 6. Direct 3D Mesh Click Raycasting (Primary Interaction Target)
  const handleCanvasClick = (event) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const lvl = getHierarchyLevel(currentLevelIdRef.current);
    if (!lvl) return;
    const activeRoot = stageRootsRef.current?.[lvl.rootNode];
    if (!activeRoot) return;

    const intersects = raycaster.intersectObject(activeRoot, true);
    const visibleHit = intersects.find((hit) => hit.object && hit.object.isMesh && hit.object.visible);

    if (visibleHit) {
      const mesh = visibleHit.object;
      const meshName = mesh.name || 'component';

      // Look up component details from lvl.components
      let matchedComp = null;
      if (lvl.components) {
        for (const [key, comp] of Object.entries(lvl.components)) {
          if (comp.meshMatch && comp.meshMatch.some((m) => meshName.toLowerCase().includes(m.toLowerCase()))) {
            matchedComp = { id: key, ...comp, meshName };
            break;
          }
          if (meshName.toLowerCase().includes(key.toLowerCase())) {
            matchedComp = { id: key, ...comp, meshName };
            break;
          }
        }
      }

      if (!matchedComp) {
        matchedComp = {
          id: meshName,
          name: meshName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          subtitle: lvl.shortName,
          desc: `Identified structural region within ${lvl.label}.`,
          keyFunctions: lvl.keyFunctions,
          meshName,
        };
      }

      // Highlight the clicked 3D mesh
      highlightMesh(mesh);

      // Handle double click (drill down) vs single click (inspect)
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        if (lvl.childId && onDrillDown) {
          onDrillDown(lvl.childId);
        }
      } else {
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null;
          if (onSelectComponent) {
            onSelectComponent(matchedComp);
          }
        }, 220);
      }
    }
  };

  // Helper to select a component via callout label
  const handleSelectCallout = (lbl) => {
    const lvl = getHierarchyLevel(currentLevelIdRef.current);
    let compData = null;
    if (lvl.components) {
      if (lvl.components[lbl.id]) {
        compData = { id: lbl.id, ...lvl.components[lbl.id] };
      } else {
        for (const [key, comp] of Object.entries(lvl.components)) {
          if (comp.name.toLowerCase() === lbl.label.toLowerCase() || (comp.meshMatch && comp.meshMatch.some((m) => lbl.id.toLowerCase().includes(m.toLowerCase())))) {
            compData = { id: key, ...comp };
            break;
          }
        }
      }
    }

    if (!compData) {
      compData = {
        id: lbl.id,
        name: lbl.label,
        subtitle: lvl.shortName,
        desc: `Identified structural feature of ${lvl.label} within the biological hierarchy.`,
        keyFunctions: lvl.keyFunctions,
      };
    }

    if (onSelectComponent) {
      onSelectComponent(compData);
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden bg-[#050c18] border border-slate-800 shadow-inner group select-none">
      
      {/* Seamless Looping Background Video */}
      <video
        ref={videoRef}
        src="/assets/olab-2/videos/sect_3_background.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050c18]/50 via-transparent to-[#050c18]/30 pointer-events-none z-0" />

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="relative w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#061121]/90 flex flex-col items-center justify-center space-y-3 z-30">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xs font-semibold text-blue-200 tracking-wide">
            Loading 3D Molecular Model...
          </span>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute top-4 left-4 right-4 bg-rose-950/80 border border-rose-700/60 p-3 rounded-xl flex items-center space-x-2 text-rose-200 text-xs z-30 backdrop-blur-sm">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Top-Right Floating Viewport Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
        <button
          onClick={handleResetView}
          className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all active:scale-95 group/btn"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={onToggleLabels}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            showLabels
              ? 'bg-[#064A8C] text-white border-blue-400/50'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-700/80'
          }`}
          title="Toggle Labels"
        >
          <Tag size={16} />
        </button>

        <button
          onClick={handleFitToView}
          className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Fit to View"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* SVG Leader Lines & 3D Anchor Pointers Overlay */}
      {showLabels && !loading && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
          <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38BDF8" />
            </marker>
          </defs>

          {projectedLabels.map((lbl) => {
            if (!lbl.isVisible || (lbl.levelId && lbl.levelId !== currentLevelId)) return null;

            // Precise button boundary calculation (approximate half-dimensions of button pill)
            const pillHalfW = Math.max(40, Math.min(80, (lbl.label.length * 6.5 + 24) / 2));
            const pillHalfH = 15;

            // Vector from label center to 3D anchor target
            const dx = lbl.anchorX - lbl.labelX;
            const dy = lbl.anchorY - lbl.labelY;

            let connectorX = lbl.labelX;
            let connectorY = lbl.labelY;

            if (Math.abs(dx) * pillHalfH > Math.abs(dy) * pillHalfW) {
              // Ray exits via left or right edge of the pill
              connectorX = dx > 0 ? lbl.labelX + pillHalfW : lbl.labelX - pillHalfW;
              connectorY = lbl.labelY + (dy * (pillHalfW / (Math.abs(dx) || 1)));
            } else {
              // Ray exits via top or bottom edge of the pill
              connectorY = dy > 0 ? lbl.labelY + pillHalfH : lbl.labelY - pillHalfH;
              connectorX = lbl.labelX + (dx * (pillHalfH / (Math.abs(dy) || 1)));
            }

            // Offset endpoint slightly back from anchor center so arrowhead stays razor-sharp
            const dist = Math.hypot(dx, dy) || 1;
            const endX = lbl.anchorX - (dx / dist) * 4;
            const endY = lbl.anchorY - (dy / dist) * 4;

            return (
              <g key={`leader-${lbl.id}`}>
                {/* Connecting Leader Line with Arrowhead pointing directly to the 3D structure */}
                <line
                  x1={connectorX}
                  y1={connectorY}
                  x2={endX}
                  y2={endY}
                  stroke="#38BDF8"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  opacity="0.9"
                />

                {/* Target Anchor Point Dot on 3D Object */}
                <circle
                  cx={lbl.anchorX}
                  cy={lbl.anchorY}
                  r="3.5"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />
                <circle
                  cx={lbl.anchorX}
                  cy={lbl.anchorY}
                  r="6"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  opacity="0.4"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Floating 3D Component Labels with High-Contrast Design */}
      {showLabels && !loading && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {projectedLabels.map((lbl) => {
            if (!lbl.isVisible || (lbl.levelId && lbl.levelId !== currentLevelId)) return null;
            const isSelected = selectedComponent?.id === lbl.id || selectedComponent?.name === lbl.label;

            return (
              <div
                key={lbl.id}
                style={{
                  left: `${lbl.labelX}px`,
                  top: `${lbl.labelY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute pointer-events-auto transition-transform duration-75"
              >
                <button
                  onClick={() => handleSelectCallout(lbl)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold tracking-tight shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#064A8C] text-white border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white border-blue-400/40 hover:border-cyan-400'
                  }`}
                  title={`Click to inspect ${lbl.label}`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shrink-0 animate-pulse" />
                  <span className="whitespace-nowrap">{lbl.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Hint Indicator */}
      <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-400/80 pointer-events-none z-10 hidden sm:block">
        Scale: {currentLevel.scale} • Click 3D component to inspect • Double-click to zoom in • Drag to orbit
      </div>

    </div>
  );
};

export default Nested3DViewer;
