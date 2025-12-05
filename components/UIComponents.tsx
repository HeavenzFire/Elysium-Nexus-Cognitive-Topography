import React from 'react';
import { ThinkerNode, Archetype } from '../types';
import { RESONANCE_THRESHOLD } from '../constants';

interface CardProps {
  node: ThinkerNode | null;
  onClose: () => void;
}

export const ThinkerDetailCard: React.FC<CardProps> = ({ node, onClose }) => {
  if (!node) return null;

  const isResonant = (node.stats.logic + node.stats.empathy) > RESONANCE_THRESHOLD;

  const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs w-20 text-gray-400 font-mono">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000" 
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs w-8 text-right text-gray-300 font-mono">{value}</span>
    </div>
  );

  return (
    <div className="absolute top-20 right-8 w-80 bg-elysium-800/90 backdrop-blur-xl border border-elysium-gold/20 p-6 rounded-sm shadow-2xl z-20 animate-fade-in-up">
      <button 
        onClick={onClose}
        className="absolute top-2 right-3 text-elysium-gold hover:text-white transition-colors text-xl"
      >
        ×
      </button>
      
      <div className="mb-6 border-b border-elysium-gold/10 pb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-mono text-elysium-accent tracking-widest uppercase block">
            Gen {node.generation} • {node.archetype}
          </span>
          {isResonant && (
            <span className="text-[10px] bg-elysium-gold/20 text-elysium-gold border border-elysium-gold px-1.5 py-0.5 rounded animate-pulse">
              AXIOM RESONANCE
            </span>
          )}
        </div>
        <h2 className="text-2xl font-serif text-elysium-pale">{node.name}</h2>
        
        {/* Instrument Display */}
        <div className="flex items-center gap-2 mt-2 text-elysium-gold/80">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span className="text-xs font-serif italic tracking-wide">
            Plays the {node.instrument}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 italic mb-6 leading-relaxed font-serif">
        "{node.description}"
      </p>

      <div className="space-y-1 mb-6">
        <StatBar label="LOGIC" value={node.stats.logic} color="#3B82F6" />
        <StatBar label="CREATIVITY" value={node.stats.creativity} color="#EC4899" />
        <StatBar label="EMPATHY" value={node.stats.empathy} color="#10B981" />
        <StatBar label="COMPLEXITY" value={node.stats.complexity} color="#D4AF37" />
      </div>

      <div className="text-xs text-gray-500 font-mono border-t border-elysium-gold/10 pt-4">
        ID: {node.id.toUpperCase()}
      </div>
    </div>
  );
};

export const LogPanel: React.FC<{ logs: any[] }> = ({ logs }) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="absolute bottom-8 left-8 w-96 max-h-60 overflow-y-auto bg-black/40 backdrop-blur-sm border-l-2 border-elysium-gold/30 p-4 font-mono text-xs">
      {logs.map((log) => (
        <div key={log.id} className="mb-2 last:mb-0">
          <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span className={`ml-2 ${
            log.type === 'birth' ? 'text-elysium-gold' : 
            log.type === 'evolution' ? 'text-purple-400' :
            log.type === 'conflict' ? 'text-red-400' : 'text-gray-300'
          }`}>
            {log.message}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export const ControlBar: React.FC<{ 
  isPaused: boolean; 
  onTogglePause: () => void;
  count: number;
  isFluxMode: boolean;
  onToggleFlux: () => void;
  currentMultiplier: number;
  onSave: () => void;
  onLoad: () => void;
  globalCoherence: number;
}> = ({ isPaused, onTogglePause, count, isFluxMode, onToggleFlux, currentMultiplier, onSave, onLoad, globalCoherence }) => {
  
  // Helper to format multiplier
  const formatMultiplier = (m: number) => {
    if (m >= 1) return `${m.toFixed(1)}x`;
    return `1/${(1/m).toFixed(0)}x`;
  };

  const speedColor = currentMultiplier > 10 ? 'text-red-400' : currentMultiplier < 0.1 ? 'text-blue-400' : 'text-gray-400';

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-elysium-700/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 shadow-xl z-10">
       <div className="flex flex-col items-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Coherence</span>
        <span className="text-elysium-gold font-serif text-lg">{globalCoherence.toFixed(1)}%</span>
      </div>

      <div className="h-8 w-px bg-white/10 mx-2"></div>

      <div className="flex flex-col items-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Awake Minds</span>
        <span className="text-elysium-pale font-serif text-lg">{count}</span>
      </div>
      
      <div className="h-8 w-px bg-white/10 mx-2"></div>

      {/* Flux Controls */}
       <div className="flex flex-col items-center min-w-[80px]">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Time Dilation</span>
        <span className={`font-mono text-lg transition-colors duration-300 ${speedColor}`}>
          {formatMultiplier(currentMultiplier)}
        </span>
      </div>

      <button 
        onClick={onToggleFlux}
        className={`
          px-4 py-2 rounded-full font-serif text-xs tracking-wide transition-all duration-300 border
          active:scale-95
          ${isFluxMode 
            ? 'bg-purple-900/50 text-purple-200 border-purple-500/50 animate-pulse-slow' 
            : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
          }
        `}
      >
        {isFluxMode ? 'FLUX: ACTIVE' : 'FLUX: STABLE'}
      </button>
      
      <div className="h-8 w-px bg-white/10 mx-2"></div>

      {/* Save/Load Controls */}
      <div className="flex gap-2">
        <button 
          onClick={onSave}
          className="px-4 py-1.5 rounded-full font-serif text-xs tracking-wide bg-transparent text-elysium-gold border border-elysium-gold/30 hover:bg-elysium-gold/10 hover:border-elysium-gold active:bg-elysium-gold/20 active:scale-95 transition-all"
          title="Save State"
        >
          SAVE
        </button>
        <button 
          onClick={onLoad}
          className="px-4 py-1.5 rounded-full font-serif text-xs tracking-wide bg-transparent text-elysium-accent border border-elysium-accent/30 hover:bg-elysium-accent/10 hover:border-elysium-accent active:bg-elysium-accent/20 active:scale-95 transition-all"
          title="Load State"
        >
          LOAD
        </button>
      </div>

      <div className="h-8 w-px bg-white/10 mx-2"></div>
      
      <button 
        onClick={onTogglePause}
        className={`
          px-6 py-2 rounded-full font-serif text-sm tracking-wide transition-all duration-300 active:scale-95
          ${isPaused 
            ? 'bg-elysium-gold text-elysium-900 hover:bg-white' 
            : 'bg-elysium-900 text-elysium-gold border border-elysium-gold/30 hover:bg-elysium-800'
          }
        `}
      >
        {isPaused ? 'RESUME' : 'PAUSE'}
      </button>
    </div>
  );
};