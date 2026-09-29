/**
 * Declarative Cytoscape Stylesheet and Semantic Color Mappings
 * for P029 Interoperabilidad del Estado Chileno
 */

import type { StylesheetStyle } from 'cytoscape';
import type { TipoNodo, EstandarProtocolo } from '../types/interoperabilidad.js';

export interface TypologyMeta {
  label: string;
  color: string;
  shape: string;
  description: string;
}

export const TIPOLOGIA_CONFIG: Record<TipoNodo, TypologyMeta> = {
  ministerio: {
    label: 'Ministerio',
    color: '#2563eb', // blue
    shape: 'round-rectangle',
    description: 'Órgano rector de políticas públicas sectoriales',
  },
  servicio_publico: {
    label: 'Servicio Público',
    color: '#0284c7', // cyan / indigo
    shape: 'ellipse',
    description: 'Entidad ejecutora especializada y proveedora de trámites',
  },
  bus_transversal: {
    label: 'Bus Transversal',
    color: '#059669', // emerald / teal
    shape: 'diamond',
    description: 'Plataforma centralizadora de interoperabilidad del Estado',
  },
  gobierno_local: {
    label: 'Gobierno Local',
    color: '#d97706', // amber
    shape: 'round-pentagon',
    description: 'Municipalidades y articulación territorial comunal',
  },
  organo_autonomo: {
    label: 'Órgano Autónomo',
    color: '#7c3aed', // purple
    shape: 'octagon',
    description: 'Entidad de control, fiscalización o representación civil',
  },
  superintendencia: {
    label: 'Superintendencia',
    color: '#e11d48', // rose
    shape: 'barrel',
    description: 'Fiscalizador regulatorio sectorial',
  },
};

export interface ProtocolMeta {
  short: string;
  label: string;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

export const PROTOCOLO_CONFIG: Record<EstandarProtocolo, ProtocolMeta> = {
  'REST / JSON': {
    short: 'REST',
    label: 'REST / JSON',
    color: '#10b981', // emerald
    lineStyle: 'solid',
  },
  'SOAP / XML (WSDL)': {
    short: 'SOAP',
    label: 'SOAP / XML',
    color: '#f59e0b', // amber
    lineStyle: 'dashed',
  },
  'OpenID Connect / OAuth2': {
    short: 'OIDC',
    label: 'OIDC / OAuth2',
    color: '#3b82f6', // blue
    lineStyle: 'solid',
  },
  'SFTP / Batch plano o CSV': {
    short: 'SFTP',
    label: 'SFTP / Batch',
    color: '#f97316', // orange
    lineStyle: 'dotted',
  },
  'Webhooks / Event-driven': {
    short: 'Webhook',
    label: 'Webhooks / Event-driven',
    color: '#8b5cf6', // purple
    lineStyle: 'dashed',
  },
  'Bilateral Propietario': {
    short: 'Bilateral',
    label: 'Bilateral Propietario',
    color: '#ec4899', // pink
    lineStyle: 'dashed',
  },
};

export function getShortProtocol(protocol: EstandarProtocolo | string): string {
  if (protocol in PROTOCOLO_CONFIG) {
    return PROTOCOLO_CONFIG[protocol as EstandarProtocolo].short;
  }
  if (protocol.includes('REST')) return 'REST';
  if (protocol.includes('SOAP')) return 'SOAP';
  if (protocol.includes('OpenID') || protocol.includes('OAuth')) return 'OIDC';
  if (protocol.includes('SFTP') || protocol.includes('Batch')) return 'SFTP';
  if (protocol.includes('Webhook')) return 'Webhook';
  return 'Bilateral';
}

/**
 * Declarative Cytoscape Stylesheet
 */
export const graphStyles: StylesheetStyle[] = [
  // -------------------------------------------------------------
  // Base Node Style
  // -------------------------------------------------------------
  {
    selector: 'node',
    style: {
      'label': 'data(sigla)',
      'color': '#ffffff',
      'font-size': '11px',
      'font-weight': 'bold',
      'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '70px',
      'width': 64,
      'height': 64,
      'border-width': 2,
      'border-color': '#ffffff',
      'border-opacity': 0.8,
      'transition-property': 'background-color, line-color, target-arrow-color, opacity, border-width, border-color',
      'transition-duration': 0.25,
      'opacity': 1,
    },
  },

  // -------------------------------------------------------------
  // Node Typology Shapes & Colors
  // -------------------------------------------------------------
  {
    selector: 'node[tipo = "ministerio"]',
    style: {
      'background-color': '#2563eb', // blue
      'shape': 'round-rectangle',
      'width': 76,
      'height': 54,
    },
  },
  {
    selector: 'node[tipo = "servicio_publico"]',
    style: {
      'background-color': '#0284c7', // cyan / indigo
      'shape': 'ellipse',
      'width': 64,
      'height': 64,
    },
  },
  {
    selector: 'node[tipo = "bus_transversal"]',
    style: {
      'background-color': '#059669', // emerald / teal
      'shape': 'diamond',
      'width': 80,
      'height': 80,
      'border-width': 3,
      'border-color': '#a7f3d0',
      'font-size': '12px',
    },
  },
  {
    selector: 'node[tipo = "gobierno_local"]',
    style: {
      'background-color': '#d97706', // amber
      'shape': 'round-pentagon',
      'width': 70,
      'height': 70,
    },
  },
  {
    selector: 'node[tipo = "organo_autonomo"]',
    style: {
      'background-color': '#7c3aed', // purple
      'shape': 'octagon',
      'width': 68,
      'height': 68,
    },
  },
  {
    selector: 'node[tipo = "superintendencia"]',
    style: {
      'background-color': '#e11d48', // rose
      'shape': 'barrel',
      'width': 70,
      'height': 58,
    },
  },

  // -------------------------------------------------------------
  // Base Edge Style
  // -------------------------------------------------------------
  {
    selector: 'edge',
    style: {
      'width': 2.5,
      'line-color': '#64748b',
      'target-arrow-color': '#64748b',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 1.1,
      'label': 'data(protocol_short)',
      'font-size': '9px',
      'font-weight': 'bold',
      'font-family': 'monospace',
      'text-rotation': 'autorotate',
      'text-background-opacity': 0.88,
      'text-background-color': '#090d16',
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle',
      'text-border-width': 1,
      'text-border-color': '#334155',
      'color': '#cbd5e1',
      'opacity': 0.9,
      'transition-property': 'line-color, target-arrow-color, width, opacity',
      'transition-duration': 0.25,
    },
  },

  // -------------------------------------------------------------
  // Edge Protocol Specific Styles
  // -------------------------------------------------------------
  {
    selector: 'edge[protocol_short = "REST"]',
    style: {
      'line-color': '#10b981', // emerald
      'target-arrow-color': '#10b981',
      'line-style': 'solid',
      'text-border-color': '#10b981',
      'color': '#6ee7b7',
    },
  },
  {
    selector: 'edge[protocol_short = "SOAP"]',
    style: {
      'line-color': '#f59e0b', // amber
      'target-arrow-color': '#f59e0b',
      'line-style': 'dashed',
      'text-border-color': '#f59e0b',
      'color': '#fcd34d',
    },
  },
  {
    selector: 'edge[protocol_short = "OIDC"]',
    style: {
      'line-color': '#3b82f6', // blue
      'target-arrow-color': '#3b82f6',
      'line-style': 'solid',
      'text-border-color': '#3b82f6',
      'color': '#93c5fd',
    },
  },
  {
    selector: 'edge[protocol_short = "SFTP"]',
    style: {
      'line-color': '#f97316', // orange
      'target-arrow-color': '#f97316',
      'line-style': 'dotted',
      'text-border-color': '#f97316',
      'color': '#fdba74',
    },
  },
  {
    selector: 'edge[protocol_short = "Bilateral"]',
    style: {
      'line-color': '#ec4899', // pink
      'target-arrow-color': '#ec4899',
      'line-style': 'dashed',
      'text-border-color': '#ec4899',
      'color': '#f472b6',
    },
  },

  // -------------------------------------------------------------
  // Highlight & Selection State Classes
  // -------------------------------------------------------------
  {
    selector: 'node.highlighted',
    style: {
      'border-width': 4,
      'border-color': '#38bdf8', // sky blue
      'opacity': 1,
      'z-index': 998,
    },
  },
  {
    selector: 'node.selected',
    style: {
      'border-width': 5,
      'border-color': '#facc15', // bright yellow
      'opacity': 1,
      'z-index': 999,
    },
  },
  {
    selector: 'edge.highlighted',
    style: {
      'width': 4,
      'line-color': '#38bdf8',
      'target-arrow-color': '#38bdf8',
      'opacity': 1,
      'z-index': 998,
    },
  },
  {
    selector: 'edge.selected',
    style: {
      'width': 4.5,
      'line-color': '#facc15',
      'target-arrow-color': '#facc15',
      'opacity': 1,
      'z-index': 999,
    },
  },
  {
    selector: 'node.faded',
    style: {
      'opacity': 0.15,
    },
  },
  {
    selector: 'edge.faded',
    style: {
      'opacity': 0.1,
    },
  },
  {
    selector: 'node.hidden, edge.hidden',
    style: {
      'display': 'none',
    },
  },
];
