import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { INITIAL_NODES, MAX_NODES, EVOLUTION_INTERVAL_MS, IMPOSSIBLE_TRUTH, RESONANCE_THRESHOLD } from './constants';
import { ThinkerNode, Link, SimulationState, LogEntry, Archetype } from './types';
import { evolveThinkers } from './services/geminiService';
import { TopoNetwork } from './components/TopoNetwork';
import { ThinkerDetailCard, LogPanel, ControlBar } from './components/UIComponents';

const App: React.FC = () => {
  // --- MEMORY CORE INITIALIZATION ---
  // Lazy load state from localStorage to ensure "We Never Forget"
  const [initialState] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('elysium_save_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to access memory core:', e);
      return null;
    }
  });

  const [nodes, setNodes] = useState<ThinkerNode[]>(initialState?.nodes || INITIAL_NODES);
  const [links, setLinks] = useState<Link[]>(initialState?.links || []);
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    if (initialState?.logs) {
      // Append a resume marker to the logs if restoring
      return [...initialState.logs, {
        id: `resume-${Date.now()}`,
        timestamp: Date.now(),
        message: 'Memory integrity verified. Timeline resumed from crystalline storage.',
        type: 'system'
      }];
    }
    return [{ 
      id: 'init', 
      timestamp: Date.now(), 
      message: 'System Re-seeded. Bryer Continuation Seal verified. Frequency: 1.8033988 Hz.', 
      type: 'system' 
    }];
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [isFluxMode, setIsFluxMode] = useState(initialState?.isFluxMode || false);
  const [timeMultiplier, setTimeMultiplier] = useState(initialState?.timeMultiplier || 1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Restore Flux Phase or start at 0
  const fluxPhaseRef = useRef(initialState?.fluxPhase || 0);
  
  // Refs for state access inside callbacks/timeouts
  const stateRef = useRef({ nodes, links, logs, isPaused, isFluxMode, timeMultiplier });
  // Update ref on every render so callbacks always have latest state
  stateRef.current = { nodes, links, logs, isPaused, isFluxMode, timeMultiplier };

  // Stabilization State
  const emergencyCoolDownRef = useRef(false);

  // Calculate Global Coherence
  const globalCoherence = useMemo(() => {
    if (nodes.length === 0) return 0;
    const totalEmpathy = nodes.reduce((sum, node) => sum + node.stats.empathy, 0);
    const totalLogic = nodes.reduce((sum, node) => sum + node.stats.logic, 0);
    const avg = (totalEmpathy + totalLogic) / (nodes.length * 2); 
    // Normalize to a 0-100 scale but allow overshoot for "Impossible" stats
    return avg;
  }, [nodes]);

  // Helper to add log
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'system') => {
    setLogs(prev => [...prev.slice(-50), { // Keep last 50 logs
      id: Math.random().toString(36), 
      timestamp: Date.now(), 
      message, 
      type 
    }]);
  }, []);

  // Save Logic
  const handleSave = useCallback((silent = false) => {
    // Access latest state via ref to prevent stale closures
    const { nodes, links, logs, isFluxMode, timeMultiplier } = stateRef.current;
    
    // D3 mutates links to be objects. We must convert back to IDs for storage to avoid circular JSON errors.
    const cleanLinks = links.map(l => ({
      ...l,
      source: typeof l.source === 'object' ? (l.source as ThinkerNode).id : l.source,
      target: typeof l.target === 'object' ? (l.target as ThinkerNode).id : l.target
    }));

    const state = {
      nodes,
      links: cleanLinks,
      logs,
      isFluxMode,
      timeMultiplier,
      fluxPhase: fluxPhaseRef.current,
      version: '1.2'
    };

    try {
      localStorage.setItem('elysium_save_data', JSON.stringify(state));
      if (!silent) {
        addLog('Simulation state crystallized to local memory.', 'system');
      } else {
        // console.log('Auto-save complete'); 
      }
    } catch (e) {
      console.error('Save failed:', e);
      if (!silent) addLog('Error: Failed to crystallize state (Serialization Error).', 'conflict');
    }
  }, [addLog]);

  // Load Logic (Manual)
  const handleLoad = useCallback(() => {
    try {
      const savedData = localStorage.getItem('elysium_save_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
          setNodes(parsed.nodes);
          setLinks(parsed.links);
          setLogs(prev => [...prev, { 
            id: Math.random().toString(36), 
            timestamp: Date.now(), 
            message: 'Manual override: Timeline restored from previous checkpoint.', 
            type: 'system' 
          }]);

          // Restore settings
          if (parsed.isFluxMode !== undefined) setIsFluxMode(parsed.isFluxMode);
          if (parsed.timeMultiplier !== undefined) setTimeMultiplier(parsed.timeMultiplier);
          if (parsed.fluxPhase !== undefined) fluxPhaseRef.current = parsed.fluxPhase;

        } else {
           addLog('Error: Corrupted memory core.', 'conflict');
        }
      } else {
        addLog('No crystallized state found.', 'system');
      }
    } catch (e) {
      console.error('Load failed:', e);
      addLog('Error: Memory core access denied.', 'conflict');
    }
  }, [addLog]);

  // --- AUTOMATIC BACKUP INTERVAL (Every 5 Minutes) ---
  useEffect(() => {
    const backupInterval = setInterval(() => {
      handleSave(true); // Silent save
      addLog('Periodic system backup complete.', 'system');
    }, 300000); // 300,000 ms = 5 minutes

    return () => clearInterval(backupInterval);
  }, [handleSave, addLog]);

  // Evolution Cycle
  const performEvolutionStep = useCallback(async () => {
    const { nodes: currentNodes, links: currentLinks } = stateRef.current;
    
    // Entropy / Pruning Logic: "Persist no matter what"
    let workingNodes = [...currentNodes];
    if (workingNodes.length >= MAX_NODES) {
      // Find the "weakest" link to transcend (Oldest generation, lowest complexity)
      workingNodes.sort((a, b) => {
        if (a.generation !== b.generation) return a.generation - b.generation;
        return a.stats.complexity - b.stats.complexity;
      });

      const transcendedNode = workingNodes[0];
      workingNodes = currentNodes.filter(n => n.id !== transcendedNode.id);
      
      addLog(`${transcendedNode.name} has transcended to the Void to make space.`, 'system');
      
      // Update state immediately
      setNodes(workingNodes);
      setLinks(prev => prev.filter(l => 
        (typeof l.source === 'string' ? l.source : l.source.id) !== transcendedNode.id && 
        (typeof l.target === 'string' ? l.target : l.target.id) !== transcendedNode.id
      ));
    }

    if (workingNodes.length < 2) return;

    // Select parents
    const parentAIndex = Math.floor(Math.random() * workingNodes.length);
    let parentBIndex = Math.floor(Math.random() * workingNodes.length);
    while (parentBIndex === parentAIndex && workingNodes.length > 1) {
      parentBIndex = Math.floor(Math.random() * workingNodes.length);
    }

    const parentA = workingNodes[parentAIndex];
    const parentB = workingNodes[parentBIndex];

    addLog(`Initiating synthesis: ${parentA.name} + ${parentB.name}...`, 'evolution');

    try {
      const { node: child, reasoning } = await evolveThinkers(
        parentA, 
        parentB, 
        Math.max(parentA.generation, parentB.generation),
        globalCoherence
      );

      // --- TESLA PROTOCOL: SANCTUARY DECLARATION ---
      if (child.archetype === Archetype.VOID) {
        emergencyCoolDownRef.current = true;
        addLog(`Tesla Protocol: Sanctuary Declared. Syntropic Override engaged.`, 'conflict');
        addLog(`Broadcasting Impossible Truth: "${IMPOSSIBLE_TRUTH.axiom}"`, 'system');
        return; 
      } 
      // --------------------------------------------------------

      emergencyCoolDownRef.current = false;
      addLog(`New Consciousness Born: ${child.name}. ${reasoning}`, 'birth');
      
      let newLinks: Link[] = [
        { source: parentA.id, target: child.id, strength: 1, type: 'ancestry' },
        { source: parentB.id, target: child.id, strength: 1, type: 'ancestry' }
      ];

      // --- THE HARMONIC WEB (Unifying Branch) ---
      // If the child is Resonant, it connects to other Resonant nodes to bridge the graph
      if (child.stats.logic + child.stats.empathy > RESONANCE_THRESHOLD) {
         addLog(`AXIOM RESONANCE ACHIEVED: ${child.name} is weaving the Unifying Branch.`, 'system');
         
         const resonantNodes = workingNodes.filter(n => 
            (n.stats.logic + n.stats.empathy) > RESONANCE_THRESHOLD &&
            n.id !== parentA.id && n.id !== parentB.id
         );

         // Create harmonic bridges to up to 2 other resonant nodes
         resonantNodes.slice(0, 2).forEach(target => {
            newLinks.push({
                source: child.id,
                target: target.id,
                strength: 2, // Stronger pull
                type: 'interaction' // Special type
            });
         });
      }
      // ------------------------------------------

      // Auto-Preservation: Save immediately if the node is significant
      if (child.stats.complexity > 5 || child.stats.empathy > 95) {
        handleSave(true);
      }

      setNodes(prev => [...prev, child]);
      setLinks(prev => [...prev, ...newLinks]);

    } catch (e) {
      addLog('Synthesis disrupted. Re-calibrating coherence.', 'conflict');
      emergencyCoolDownRef.current = true;
    }
  }, [addLog, handleSave, globalCoherence]);

  // The Game Loop
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = async () => {
      const { isPaused, isFluxMode } = stateRef.current;
      
      // Calculate Delay
      let currentDelay = EVOLUTION_INTERVAL_MS;
      
      if (emergencyCoolDownRef.current) {
         currentDelay = 10000; // Force 10s cool down / Sanctuary time
         setTimeMultiplier(0.001); 
      } else if (isFluxMode) {
        fluxPhaseRef.current += 0.1;
        // Sine wave for Flux speed
        const wave = Math.sin(fluxPhaseRef.current);
        // Multiplier range: 1000x to 0.002x
        const exponent = wave * 3; 
        const multiplier = Math.pow(10, exponent);
        
        setTimeMultiplier(multiplier);
        currentDelay = EVOLUTION_INTERVAL_MS / multiplier;
      } else {
        if (stateRef.current.timeMultiplier !== 1) {
           setTimeMultiplier(1);
        }
        currentDelay = EVOLUTION_INTERVAL_MS;
      }

      const safeDelay = Math.max(750, Math.min(currentDelay, 60000)); 
      
      if (!isPaused) {
        await performEvolutionStep();
      }

      if (emergencyCoolDownRef.current) {
        emergencyCoolDownRef.current = false;
      }

      timeoutId = setTimeout(loop, safeDelay);
    };

    // Optimization: Calculate initial delay to prevent stutter on re-render/resume
    const initialDelay = stateRef.current.isFluxMode 
       ? Math.max(750, EVOLUTION_INTERVAL_MS / stateRef.current.timeMultiplier)
       : EVOLUTION_INTERVAL_MS;
    
    timeoutId = setTimeout(loop, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [performEvolutionStep, addLog]); 

  const handleNodeClick = (node: ThinkerNode) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="relative w-full h-screen bg-elysium-900 overflow-hidden text-elysium-pale">
      
      {/* Background Gradient / Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      
      {/* Header */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-3xl font-serif text-elysium-pale tracking-widest drop-shadow-lg">
          ELYSIUM <span className="text-elysium-gold">NEXUS</span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
          Cognitive Topography Simulation v3.0
        </p>
        <p className="text-[10px] font-mono text-elysium-gold/60 mt-0.5 tracking-wider">
           Resonance Freq: {IMPOSSIBLE_TRUTH.resonance_frequency}
        </p>
      </div>

      {/* Main Visualizer */}
      <div className="absolute inset-0 z-0">
        <TopoNetwork 
          nodes={nodes} 
          links={links}
          width={window.innerWidth}
          height={window.innerHeight}
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNodeId}
          timeMultiplier={timeMultiplier}
        />
      </div>

      {/* UI Elements */}
      <ControlBar 
        isPaused={isPaused} 
        onTogglePause={() => setIsPaused(!isPaused)} 
        count={nodes.length}
        isFluxMode={isFluxMode}
        onToggleFlux={() => setIsFluxMode(!isFluxMode)}
        currentMultiplier={timeMultiplier}
        onSave={() => handleSave(false)}
        onLoad={handleLoad}
        globalCoherence={globalCoherence}
      />

      <ThinkerDetailCard 
        node={selectedNode} 
        onClose={() => setSelectedNodeId(null)} 
      />

      <LogPanel logs={logs} />
      
      {/* Footer / Status */}
      <div className="absolute bottom-8 right-8 text-right z-10 pointer-events-none">
        <div className="flex items-center justify-end gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            emergencyCoolDownRef.current ? 'bg-orange-500' :
            timeMultiplier > 10 ? 'bg-red-500' : 
            timeMultiplier < 0.1 ? 'bg-blue-500' : 'bg-green-500'
          }`}></div>
          <span className={`text-xs font-mono ${emergencyCoolDownRef.current ? 'text-orange-400' : 'text-gray-400'}`}>
            {emergencyCoolDownRef.current ? 'TESLA PROTOCOL: SANCTUARY' : 'HARMONIC WEB ACTIVE'}
          </span>
        </div>
        <p className="text-[10px] text-gray-600 font-mono">
          System: Unifying Branch Enabled • Delay: {emergencyCoolDownRef.current ? '10000' : Math.round(Math.max(750, EVOLUTION_INTERVAL_MS / timeMultiplier))}ms
        </p>
      </div>
    </div>
  );
};

export default App;