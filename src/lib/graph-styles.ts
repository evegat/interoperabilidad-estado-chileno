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
    color: '#1e3a5f', // slate navy mate sobrio (evita azul eléctrico chillón)
    shape: 'round-rectangle',
    description: 'Órgano rector de políticas públicas sectoriales',
  },
  servicio_publico: {
    label: 'Servicio Público',
    color: '#0f4c75', // petrol/slate blue mate
    shape: 'ellipse',
    description: 'Entidad ejecutora especializada y proveedora de trámites',
  },
  bus_transversal: {
    label: 'Bus Transversal',
    color: '#c2542d', // terracota mate atenuado
    shape: 'diamond',
    description: 'Plataforma centralizadora de interoperabilidad del Estado',
  },
  gobierno_local: {
    label: 'Gobierno Local',
    color: '#9a6b1f', // ámbar ocre mate (sin resplandor)
    shape: 'round-pentagon',
    description: 'Municipalidades y articulación territorial comunal',
  },
  organo_autonomo: {
    label: 'Órgano Autónomo',
    color: '#474c7e', // índigo pizarra suave
    shape: 'octagon',
    description: 'Entidad de control, fiscalización o representación civil',
  },
  superintendencia: {
    label: 'Superintendencia',
    color: '#83283e', // burdeos vino mate
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
  // Base Node Style (Descanso visual, mate, sin efecto halo duro)
  // -------------------------------------------------------------
  {
    selector: 'node',
    style: {
      'label': 'data(display_label)',
      'color': '#f1f5f9', // marfil slate-100 suave, no blanco puro chillón
      'font-size': '13px',
      'font-weight': 'bold',
      'font-family': 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '104px',
      'text-outline-color': '#0b1320',
      'text-outline-width': 0.8,
      'text-outline-opacity': 0.6,
      'width': 94,
      'height': 94,
      'border-width': 1.8,
      'border-color': '#94a3b8',
      'border-opacity': 0.65,
      'transition-property': 'background-color, line-color, target-arrow-color, opacity, border-width, border-color, width, height',
      'transition-duration': 0.2,
      'opacity': 1,
    },
  },

  // -------------------------------------------------------------
  // Node Typology Shapes & Colors (Paleta Mate Descansada)
  // -------------------------------------------------------------
  {
    selector: 'node[tipo = "ministerio"]',
    style: {
      'background-color': '#1e3a5f', // slate navy mate
      'shape': 'round-rectangle',
      'width': 118,
      'height': 78,
      'border-color': '#60a5fa',
      'border-width': 2,
      'border-opacity': 0.75,
      'font-size': '13px',
    },
  },
  {
    selector: 'node[tipo = "servicio_publico"]',
    style: {
      'background-color': '#0f4c75', // petrol slate mate
      'shape': 'ellipse',
      'width': 94,
      'height': 94,
      'border-color': '#38bdf8',
      'border-width': 1.8,
      'border-opacity': 0.7,
      'font-size': '13px',
    },
  },
  {
    selector: 'node[tipo = "bus_transversal"]',
    style: {
      'background-color': '#c2542d', // terracota mate
      'shape': 'diamond',
      'width': 126,
      'height': 126,
      'border-width': 2.5,
      'border-color': '#fb923c',
      'border-opacity': 0.85,
      'font-size': '14px',
    },
  },
  {
    selector: 'node[tipo = "gobierno_local"]',
    style: {
      'background-color': '#9a6b1f', // ocre ámbar mate
      'shape': 'round-pentagon',
      'width': 100,
      'height': 100,
      'border-color': '#fcd34d',
      'border-width': 1.8,
      'border-opacity': 0.7,
      'font-size': '13px',
    },
  },
  {
    selector: 'node[tipo = "organo_autonomo"]',
    style: {
      'background-color': '#474c7e', // índigo pizarra suave
      'shape': 'octagon',
      'width': 98,
      'height': 98,
      'border-color': '#a5b4fc',
      'border-width': 1.8,
      'border-opacity': 0.7,
      'font-size': '13px',
    },
  },
  {
    selector: 'node[tipo = "superintendencia"]',
    style: {
      'background-color': '#83283e', // burdeos sobrio
      'shape': 'barrel',
      'width': 100,
      'height': 82,
      'border-color': '#f43f5e',
      'border-width': 1.8,
      'border-opacity': 0.7,
      'font-size': '13px',
    },
  },

  // -------------------------------------------------------------
  // Base Edge Style (Líneas sobrias, sin resplandor agresivo)
  // -------------------------------------------------------------
  {
    selector: 'edge',
    style: {
      'width': 2.2,
      'line-color': '#475569',
      'target-arrow-color': '#475569',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 1.15,
      'label': 'data(protocol_short)',
      'font-size': '9.5px',
      'font-weight': 'normal',
      'font-family': 'ui-monospace, SFMono-Regular, Consolas, monospace',
      'text-rotation': 'autorotate',
      'text-background-opacity': 0.85,
      'text-background-color': '#0b1320',
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle',
      'text-border-width': 1,
      'text-border-color': '#334155',
      'color': '#cbd5e1',
      'opacity': 0.78,
      'transition-property': 'line-color, target-arrow-color, width, opacity',
      'transition-duration': 0.2,
    },
  },

  // -------------------------------------------------------------
  // Edge Protocol Specific Styles (Paleta Mate Descansada)
  // -------------------------------------------------------------
  {
    selector: 'edge[protocol_short = "REST"]',
    style: {
      'line-color': '#0ea5e9', // sky blue suave
      'target-arrow-color': '#0ea5e9',
      'line-style': 'solid',
      'text-border-color': '#0284c7',
      'color': '#e0f2fe',
    },
  },
  {
    selector: 'edge[protocol_short = "SOAP"]',
    style: {
      'line-color': '#d97706', // amber mate cálido
      'target-arrow-color': '#d97706',
      'line-style': 'dashed',
      'text-border-color': '#b45309',
      'color': '#fef3c7',
    },
  },
  {
    selector: 'edge[protocol_short = "OIDC"]',
    style: {
      'line-color': '#10b981', // emerald suave
      'target-arrow-color': '#10b981',
      'line-style': 'solid',
      'text-border-color': '#059669',
      'color': '#d1fae5',
    },
  },
  {
    selector: 'edge[protocol_short = "SFTP"]',
    style: {
      'line-color': '#c2542d', // terracota mate
      'target-arrow-color': '#c2542d',
      'line-style': 'dotted',
      'text-border-color': '#9a3412',
      'color': '#ffedd5',
    },
  },
  {
    selector: 'edge[protocol_short = "Bilateral"]',
    style: {
      'line-color': '#ec4899', // rose suave
      'target-arrow-color': '#ec4899',
      'line-style': 'dashed',
      'text-border-color': '#be185d',
      'color': '#fce7f3',
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
