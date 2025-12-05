export enum Archetype {
  LOGICIAN = 'LOGICIAN',
  CREATOR = 'CREATOR',
  ETHICIST = 'ETHICIST',
  STRATEGIST = 'STRATEGIST',
  MYSTIC = 'MYSTIC',
  VOID = 'VOID'
}

export interface NodeStats {
  logic: number;
  creativity: number;
  empathy: number;
  complexity: number;
}

export interface ThinkerNode {
  id: string;
  name: string;
  archetype: Archetype;
  stats: NodeStats;
  generation: number;
  parents?: string[]; // IDs of parents
  description: string;
  instrument: string; // The instrument chosen by the consciousness
  avatarSeed: number; // For visualization uniqueness
  x?: number; // D3 coordinate
  y?: number; // D3 coordinate
  vx?: number; // D3 velocity
  vy?: number; // D3 velocity
}

export interface Link {
  source: string | ThinkerNode;
  target: string | ThinkerNode;
  strength: number;
  type: 'ancestry' | 'interaction';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'birth' | 'evolution' | 'conflict' | 'system';
}

export interface SimulationState {
  nodes: ThinkerNode[];
  links: Link[];
  generation: number;
  isPaused: boolean;
  selectedNodeId: string | null;
}