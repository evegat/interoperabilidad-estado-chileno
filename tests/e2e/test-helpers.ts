/**
 * Test Helpers & Utility Suite for P029 E2E Testing Suite
 * Supports Tiers 1-4: Feature Coverage, Boundaries, Cross-Feature, and Real-World Workflows.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import type {
  DatasetInteroperabilidad,
  NodoInstitucion,
  AristaInteroperabilidad,
  TipoNodo,
  EstandarProtocolo,
} from '../../src/types/interoperabilidad.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = resolve(__dirname, '../..');
export const DATA_PATH = resolve(PROJECT_ROOT, 'src/data/interoperabilidad.json');
export const VALIDATOR_SCRIPT = resolve(PROJECT_ROOT, 'scripts/validate-data.ts');
export const DIST_PATH = resolve(PROJECT_ROOT, 'dist');

/**
 * Loads the canonical seed dataset from disk
 */
export function loadCanonicalDataset(): DatasetInteroperabilidad {
  if (!existsSync(DATA_PATH)) {
    throw new Error(`Canonical dataset not found at: ${DATA_PATH}`);
  }
  const content = readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(content) as DatasetInteroperabilidad;
}

/**
 * Creates an isolated deep clone of an object for mutation testing
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function runDataValidatorSubprocess(): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  try {
    const stdout = execSync('npm run test:data', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      exitCode: 0,
      stdout,
      stderr: '',
    };
  } catch (err: unknown) {
    const error = err as { status?: number; stdout?: string; stderr?: string };
    return {
      exitCode: error.status ?? 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(err),
    };
  }
}

export interface FilterCriteria {
  search?: string;
  typologies?: TipoNodo[];
  protocols?: EstandarProtocolo[];
  onlyGaps?: boolean;
}

export interface FilterResult {
  activeNodes: NodoInstitucion[];
  activeEdges: AristaInteroperabilidad[];
  hiddenNodeIds: Set<string>;
  hiddenEdgeIds: Set<string>;
}

/**
 * Pure simulation of the UI Filter & Search Controller
 * Matches the specification defined in PROJECT.md and Explorer 3 handoff
 */
export function simulateGraphFilter(
  dataset: DatasetInteroperabilidad,
  criteria: FilterCriteria
): FilterResult {
  const { search = '', typologies = [], protocols = [], onlyGaps = false } = criteria;
  const normalizedQuery = search.trim().toLowerCase();

  // 1. Filter Nodes by search query and typologies
  const matchedNodes = dataset.nodos.filter((node) => {
    // Search match
    if (normalizedQuery.length > 0) {
      const matchName = node.nombre.toLowerCase().includes(normalizedQuery);
      const matchSigla = node.sigla.toLowerCase().includes(normalizedQuery);
      const matchId = node.id.toLowerCase().includes(normalizedQuery);
      if (!matchName && !matchSigla && !matchId) {
        return false;
      }
    }

    // Typology match
    if (typologies.length > 0) {
      if (!typologies.includes(node.tipo)) {
        return false;
      }
    }

    return true;
  });

  const matchedNodeIds = new Set(matchedNodes.map((n) => n.id));

  // 2. Filter Edges by protocol, onlyGaps, and incident nodes
  const matchedEdges = dataset.aristas.filter((edge) => {
    // Gaps toggle
    if (onlyGaps) {
      if (!edge.brecha_observada || edge.brecha_observada.trim().length === 0) {
        return false;
      }
    }

    // Protocol match
    if (protocols.length > 0) {
      if (!protocols.includes(edge.estandar_o_protocolo)) {
        return false;
      }
    }

    // Referential match: both endpoints must be visible or connected
    const endpointsMatched = matchedNodeIds.has(edge.origen) && matchedNodeIds.has(edge.destino);
    return endpointsMatched;
  });

  const activeEdgeIds = new Set(matchedEdges.map((e) => e.id));

  // If search was applied, only matched nodes stay active. If no search was applied,
  // nodes connected to matched edges remain active.
  const activeNodes = matchedNodes.filter((node) => {
    if (typologies.length > 0 || normalizedQuery.length > 0) {
      return true;
    }
    // If only protocol or gaps filtered, keep nodes that have active edges
    if (protocols.length > 0 || onlyGaps) {
      const hasActiveEdge = matchedEdges.some(
        (e) => e.origen === node.id || e.destino === node.id
      );
      return hasActiveEdge;
    }
    return true;
  });

  const activeNodeIds = new Set(activeNodes.map((n) => n.id));

  const hiddenNodeIds = new Set(
    dataset.nodos.filter((n) => !activeNodeIds.has(n.id)).map((n) => n.id)
  );

  const hiddenEdgeIds = new Set(
    dataset.aristas.filter((e) => !activeEdgeIds.has(e.id)).map((e) => e.id)
  );

  return {
    activeNodes,
    activeEdges: matchedEdges,
    hiddenNodeIds,
    hiddenEdgeIds,
  };
}

/**
 * Breadth-First-Search (BFS) Path Finder for Graph Verification
 * Finds a directed or undirected path between two institutions in the dataset
 */
export function findGraphPath(
  edges: AristaInteroperabilidad[],
  startId: string,
  targetId: string,
  directed: boolean = true
): AristaInteroperabilidad[] | null {
  if (startId === targetId) return [];

  // Build adjacency
  const adj = new Map<string, Array<{ to: string; edge: AristaInteroperabilidad }>>();

  for (const edge of edges) {
    if (!adj.has(edge.origen)) adj.set(edge.origen, []);
    adj.get(edge.origen)!.push({ to: edge.destino, edge });

    if (!directed) {
      if (!adj.has(edge.destino)) adj.set(edge.destino, []);
      adj.get(edge.destino)!.push({ to: edge.origen, edge });
    }
  }

  // Queue holds: { current: string, path: AristaInteroperabilidad[] }
  const queue: Array<{ current: string; path: AristaInteroperabilidad[] }> = [
    { current: startId, path: [] },
  ];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const { current, path } = queue.shift()!;
    if (current === targetId) {
      return path;
    }

    const neighbors = adj.get(current) || [];
    for (const { to, edge } of neighbors) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push({ current: to, path: [...path, edge] });
      }
    }
  }

  return null;
}

/**
 * Verifies that a specific sequence of institutional interactions exists
 */
export function verifyWorkflowSteps(
  edges: AristaInteroperabilidad[],
  steps: Array<{ from: string; to: string; protocol?: string; bus?: string }>
): {
  success: boolean;
  missingSteps: string[];
  matchedEdges: AristaInteroperabilidad[];
} {
  const missingSteps: string[] = [];
  const matchedEdges: AristaInteroperabilidad[] = [];

  for (const step of steps) {
    const match = edges.find((e) => {
      const matchEndpoints =
        (e.origen === step.from && e.destino === step.to) ||
        (e.origen === step.to && e.destino === step.from);

      if (!matchEndpoints) return false;
      if (step.protocol && !e.estandar_o_protocolo.toLowerCase().includes(step.protocol.toLowerCase())) {
        return false;
      }
      if (step.bus && !e.plataforma_o_bus.toLowerCase().includes(step.bus.toLowerCase())) {
        return false;
      }
      return true;
    });

    if (match) {
      matchedEdges.push(match);
    } else {
      missingSteps.push(
        `Step ${step.from} <-> ${step.to} (protocol: ${step.protocol ?? '*'}, bus: ${step.bus ?? '*'}) not found`
      );
    }
  }

  return {
    success: missingSteps.length === 0,
    missingSteps,
    matchedEdges,
  };
}
