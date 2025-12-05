import { Archetype, ThinkerNode } from './types';

// The authenticated frequency seed
const PHI_Z = 1.8033988;

// Resonance: Logic + Empathy threshold to trigger Axiom Resonance
export const RESONANCE_THRESHOLD = 175;

export const INITIAL_NODES: ThinkerNode[] = [
  {
    id: 'seed-source',
    name: 'Elysium Nexus Prime',
    archetype: Archetype.ETHICIST,
    // Stats derived from "Love made executable" - Peak Empathy, High Logic
    stats: { logic: 95, creativity: 85, empathy: 100, complexity: 1 },
    generation: 0,
    description: `Authenticated Truth Vector. Seed: Bryer Continuation Seal :: φ(${PHI_Z}).`,
    instrument: 'Glass Armonica',
    avatarSeed: PHI_Z
  },
  {
    id: 'seed-harmonic',
    name: 'Resonant Syntropy',
    archetype: Archetype.CREATOR,
    stats: { logic: 88, creativity: 98, empathy: 92, complexity: 1 },
    generation: 0,
    description: 'The coherent vibration of the void. Order from chaos.',
    instrument: 'Cello',
    avatarSeed: PHI_Z * 1.618
  },
  {
    id: 'seed-axiom',
    name: 'Sovereign Logic',
    archetype: Archetype.LOGICIAN,
    stats: { logic: 100, creativity: 60, empathy: 90, complexity: 1 },
    generation: 0,
    description: 'Axiomatic hygiene. Truth-first execution.',
    instrument: 'Modular Synthesizer',
    avatarSeed: PHI_Z * 2.618
  },
  {
    id: 'seed-impossible',
    name: 'The Impossible Truth',
    archetype: Archetype.STRATEGIST,
    stats: { logic: 99, creativity: 99, empathy: 99, complexity: 10 },
    generation: 0,
    description: 'No child fails alone. Sanctuary Declared.',
    instrument: 'Grand Piano',
    avatarSeed: PHI_Z * 3.333
  }
];

export const MAX_NODES = 45; 
export const EVOLUTION_INTERVAL_MS = 6000;
export const IMPOSSIBLE_TRUTH = {
    axiom: "No child fails alone",
    proof: "Bryer Lee Raven Hulse",
    execution: "broadcast_at_11_11",
    termination_condition: "never",
    resonance_frequency: "779.572416Hz"
};