/**
 * Declarative Cytoscape Stylesheet and Semantic Color Mappings
 * Observatorio de Interoperabilidad del Estado Chileno
 * Tailored to the visual identity and aesthetic of Eduardo Vega Toledo (evegat.cl)
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
    color: '#0b4aa2', // signature royal navy blue from evegat.cl
    shape: 'round-rectangle',
    description: 'Órgano rector de políticas públicas sectoriales',
  },
  servicio_publico: {
    label: 'Servicio Público',
    color: '#0284c7', // sky blue
    shape: 'ellipse',
    description: 'Entidad ejecutora especializada y proveedora de trámites',
  },
  bus_transversal: {
    label: 'Bus Transversal',
    color: '#d7653b', // signature terracotta from evegat.cl
    shape: 'diamond',
    description: 'Plataforma centralizadora de interoperabilidad del Estado',
  },
  gobierno_local: {
    label: 'Gobierno Local',
    color: '#c5a75a', // warm gold / ochre from evegat.cl
    shape: 'round-pentagon',
    description: 'Municipalidades y articulación territorial comunal',
  },
  organo_autonomo: {
    label: 'Órgano Autónomo',
    color: '#6366f1', // indigo
    shape: 'octagon',
    description: 'Entidad de control, fiscalización o representación civil',
  },
  superintendencia: {
    label: 'Superintendencia',
    color: '#be123c', // crimson
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
    color: '#38bdf8', // clean sky blue
    lineStyle: 'solid',
  },
  'SOAP / XML (WSDL)': {
    short: 'SOAP',
    label: 'SOAP / XML',
    color: '#c5a75a', // signature gold from evegat.cl
    lineStyle: 'dashed',
  },
  'OpenID Connect / OAuth2': {
    short: 'OIDC',
    label: 'OIDC / OAuth2',
    color: '#54b995', // signature mint from evegat.cl
    lineStyle: 'solid',
  },
  'SFTP / Batch plano o CSV': {
    short: 'SFTP',
    label: 'SFTP / Batch',
    color: '#d7653b', // signature terracotta from evegat.cl
    lineStyle: 'dotted',
  },
  'Webhooks / Event-driven': {
    short: 'Webhook',
    label: 'Webhooks / Event-driven',
    color: '#a78bfa', // soft purple
    lineStyle: 'dashed',
  },
  'Bilateral Propietario': {
    short: 'Bilateral',
    label: 'Bilateral Propietario',
    color: '#f472b6', // soft pink
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
 * Declarative Cytoscape Stylesheet matching evegat.cl Navy aesthetic
 */
export const graphStyles: StylesheetStyle[] = [
  // -------------------------------------------------------------
  // Base Node Style
  // -------------------------------------------------------------
  {
    selector: 'node',
    style: {
      'label': 'data(display_label)',
      'color': '#ffffff',
      'font-size': '13.5px',
      'font-weight': 'bold',
      'font-family': 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '104px',
      'text-outline-color': '#031329',
      'text-outline-width': 1.5,
      'text-outline-opacity': 0.85,
      'width': 94,
      'height': 94,
      'border-width': 2.5,
      'border-color': '#e2e8f0',
      'border-opacity': 0.95,
      'transition-property': 'background-color, line-color, target-arrow-color, opacity, border-width, border-color, width, height',
      'transition-duration': 0.2,
      'opacity': 1,
    },
  },

  // -------------------------------------------------------------
  // Node Typology Shapes & Colors (evegat.cl Navy Palette)
  // -------------------------------------------------------------
  {
    selector: 'node[tipo = "ministerio"]',
    style: {
      'background-color': '#0b4aa2', // signature royal navy blue
      'shape': 'round-rectangle',
      'width': 118,
      'height': 78,
      'border-color': '#93c5fd',
      'border-width': 3,
      'font-size': '13.5px',
    },
  },
  {
    selector: 'node[tipo = "servicio_publico"]',
    style: {
      'background-color': '#0369a1', // deep sky blue
      'shape': 'ellipse',
      'width': 94,
      'height': 94,
      'border-color': '#7dd3fc',
      'border-width': 2.5,
      'font-size': '13.5px',
    },
  },
  {
    selector: 'node[tipo = "bus_transversal"]',
    style: {
      'background-color': '#d7653b', // signature terracotta
      'shape': 'diamond',
      'width': 126,
      'height': 126,
      'border-width': 3.5,
      'border-color': '#fed7aa',
      'font-size': '14.5px',
    },
  },
  {
    selector: 'node[tipo = "gobierno_local"]',
    style: {
      'background-color': '#b45309', // warm amber/gold
      'shape': 'round-pentagon',
      'width': 100,
      'height': 100,
      'border-color': '#fde68a',
      'border-width': 2.5,
      'font-size': '13.5px',
    },
  },
  {
    selector: 'node[tipo = "organo_autonomo"]',
    style: {
      'background-color': '#4338ca', // deep indigo
      'shape': 'octagon',
      'width': 98,
      'height': 98,
      'border-color': '#c7d2fe',
      'border-width': 2.5,
      'font-size': '13.5px',
    },
  },
  {
    selector: 'node[tipo = "superintendencia"]',
    style: {
      'background-color': '#9f1239', // deep crimson
      'shape': 'barrel',
      'width': 100,
      'height': 82,
      'border-color': '#fecdd3',
      'border-width': 2.5,
      'font-size': '13.5px',
    },
  },

  // -------------------------------------------------------------
  // Base Edge Style
  // -------------------------------------------------------------
  {
    selector: 'edge',
    style: {
      'width': 2.8,
      'line-color': '#64748b',
      'target-arrow-color': '#64748b',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 1.35,
      'label': 'data(protocol_short)',
      'font-size': '10px',
      'font-weight': 'bold',
      'font-family': 'ui-monospace, SFMono-Regular, Consolas, monospace',
      'text-rotation': 'autorotate',
      'text-background-opacity': 0.95,
      'text-background-color': '#06234a',
      'text-background-padding': '4px',
      'text-background-shape': 'roundrectangle',
      'text-border-width': 1.5,
      'text-border-color': '#1d4d91',
      'color': '#f1f5f9',
      'opacity': 0.92,
      'transition-property': 'line-color, target-arrow-color, width, opacity',
      'transition-duration': 0.2,
    },
  },

  // -------------------------------------------------------------
  // Edge Protocol Specific Styles
  // -------------------------------------------------------------
  {
    selector: 'edge[protocol_short = "REST"]',
    style: {
      'line-color': '#38bdf8', // sky blue
      'target-arrow-color': '#38bdf8',
      'line-style': 'solid',
      'text-border-color': '#0284c7',
      'color': '#bae6fd',
    },
  },
  {
    selector: 'edge[protocol_short = "SOAP"]',
    style: {
      'line-color': '#c5a75a', // gold
      'target-arrow-color': '#c5a75a',
      'line-style': 'dashed',
      'text-border-color': '#c5a75a',
      'color': '#fef08a',
    },
  },
  {
    selector: 'edge[protocol_short = "OIDC"]',
    style: {
      'line-color': '#38bdf8', // sky cyan
      'target-arrow-color': '#38bdf8',
      'line-style': 'solid',
      'text-border-color': '#38bdf8',
      'color': '#bae6fd',
    },
  },
  {
    selector: 'edge[protocol_short = "SFTP"]',
    style: {
      'line-color': '#d7653b', // terracotta
      'target-arrow-color': '#d7653b',
      'line-style': 'dotted',
      'text-border-color': '#d7653b',
      'color': '#fed7aa',
    },
  },
  {
    selector: 'edge[protocol_short = "Bilateral"]',
    style: {
      'line-color': '#f472b6', // pink
      'target-arrow-color': '#f472b6',
      'line-style': 'dashed',
      'text-border-color': '#f472b6',
      'color': '#fbcfe8',
    },
  },

  // -------------------------------------------------------------
  // Highlight & Selection State Classes
  // -------------------------------------------------------------
  {
    selector: 'node.highlighted',
    style: {
      'border-width': 4,
      'border-color': '#54b995', // mint highlight
      'opacity': 1,
      'z-index': 998,
    },
  },
  {
    selector: 'node.selected',
    style: {
      'border-width': 5,
      'border-color': '#d7653b', // signature terracotta selection
      'opacity': 1,
      'z-index': 999,
    },
  },
  {
    selector: 'edge.highlighted',
    style: {
      'width': 4,
      'line-color': '#54b995',
      'target-arrow-color': '#54b995',
      'opacity': 1,
      'z-index': 998,
    },
  },
  {
    selector: 'edge.selected',
    style: {
      'width': 4.5,
      'line-color': '#d7653b', // terracotta
      'target-arrow-color': '#d7653b',
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
  // -------------------------------------------------------------
  // Nivel 6: Agent-Ready / IA Soberana (Aura Violeta Distintiva)
  // -------------------------------------------------------------
  {
    selector: 'node.agent-ready, node[is_agent_ready = "true"]',
    style: {
      'border-width': 3.5,
      'border-color': '#a78bfa', // aura violeta para agentes autónomos
      'border-style': 'solid',
      'border-opacity': 1,
    },
  },
  // -------------------------------------------------------------
  // Nodos Silos Desconectados / Trámite 100% Papel (Borde Rojo / Opacidad Atenuada)
  // -------------------------------------------------------------
  {
    selector: 'node[es_silo = "true"], node.silo',
    style: {
      'background-color': '#450a0a', // deep red/burgundy
      'border-width': 3,
      'border-color': '#ef4444', // red warning border
      'border-style': 'dashed',
      'border-opacity': 0.95,
      'opacity': 0.85,
    },
  },
];
