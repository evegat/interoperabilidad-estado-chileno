/**
 * Pure Client TypeScript Controller for Cytoscape.js Network Graph
 * Runs strictly in the browser inside client script.
 * P029 - Interoperabilidad Estado Chileno
 */

import cytoscape, { type Core, type ElementDefinition, type NodeSingular, type EdgeSingular } from 'cytoscape';
import type {
  DatasetInteroperabilidad,
  NodoInstitucion,
  AristaInteroperabilidad,
  TipoNodo,
  EstandarProtocolo,
} from '../types/interoperabilidad.js';
import { graphStyles, getShortProtocol } from './graph-styles.js';

export interface FilterState {
  search: string;
  typologies: TipoNodo[];
  protocols: EstandarProtocolo[];
  onlyGaps: boolean;
}

export interface NodeDrawerPayload {
  id: string;
  nombre: string;
  sigla: string;
  tipo: TipoNodo;
  dependencia: string;
  rol_ecosistema: string;
  sitio_web: string;
  nivel_madurez_digital: string;
  estado_adopcion_ley21180: string;
  total_conexiones: number;
  in_degree: number;
  out_degree: number;
  aristas_entrantes: Array<{ id: string; origen: string; bus: string }>;
  aristas_salientes: Array<{ id: string; destino: string; bus: string }>;
}

export interface EdgeDrawerPayload {
  id: string;
  origen_id: string;
  origen_sigla: string;
  origen_nombre: string;
  destino_id: string;
  destino_sigla: string;
  destino_nombre: string;
  plataforma_o_bus: string;
  tipo_dato: string;
  estandar_o_protocolo: EstandarProtocolo;
  nivel_apertura: string;
  fuente_oficial_url: string;
  brecha_observada: string;
  frecuencia_actualizacion: string;
  base_legal: string;
}

export type SelectionEventDetail =
  | { type: 'node'; data: NodeDrawerPayload; payload: NodeDrawerPayload }
  | { type: 'edge'; data: EdgeDrawerPayload; payload: EdgeDrawerPayload }
  | { type: 'none'; data: null; payload: null };

export class GraphController {
  public cy: Core | null = null;
  private dataset: DatasetInteroperabilidad;
  private nodeMap: Map<string, NodoInstitucion> = new Map();
  private edgeMap: Map<string, AristaInteroperabilidad> = new Map();
  private filters: FilterState = {
    search: '',
    typologies: [],
    protocols: [],
    onlyGaps: false,
  };

  constructor(dataset: DatasetInteroperabilidad) {
    this.dataset = dataset;
    for (const nodo of dataset.nodos) {
      this.nodeMap.set(nodo.id, nodo);
    }
    for (const arista of dataset.aristas) {
      this.edgeMap.set(arista.id, arista);
    }
  }

  public init(container: HTMLElement): Core {
    const elements: ElementDefinition[] = [
      ...this.dataset.nodos.map((nodo) => ({
        group: 'nodes' as const,
        data: {
          id: nodo.id,
          sigla: nodo.sigla,
          nombre: nodo.nombre,
          tipo: nodo.tipo,
          dependencia: nodo.dependencia,
          rol_ecosistema: nodo.rol_ecosistema,
          sitio_web: nodo.sitio_web,
          nivel_madurez_digital: nodo.nivel_madurez_digital,
          estado_adopcion_ley21180: nodo.estado_adopcion_ley21180,
        },
      })),
      ...this.dataset.aristas.map((arista) => ({
        group: 'edges' as const,
        data: {
          id: arista.id,
          source: arista.origen,
          target: arista.destino,
          plataforma_o_bus: arista.plataforma_o_bus,
          tipo_dato: arista.tipo_dato,
          estandar_o_protocolo: arista.estandar_o_protocolo,
          protocol_short: getShortProtocol(arista.estandar_o_protocolo),
          nivel_apertura: arista.nivel_apertura,
          fuente_oficial_url: arista.fuente_oficial_url,
          brecha_observada: arista.brecha_observada,
          frecuencia_actualizacion: arista.frecuencia_actualizacion,
          base_legal: arista.base_legal || 'Ley N° 21.180',
          has_gap: Boolean(arista.brecha_observada && arista.brecha_observada.length > 5) ? 'true' : 'false',
        },
      })),
    ];

    const cy = cytoscape({
      container,
      elements,
      style: graphStyles,
      layout: {
        name: 'cose',
        animate: false,
        componentSpacing: 90,
        nodeRepulsion: () => 450000,
        nodeOverlap: 25,
        idealEdgeLength: () => 130,
        edgeElasticity: () => 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        padding: 50,
      },
      minZoom: 0.25,
      maxZoom: 3.5,
      wheelSensitivity: 0.35,
    });

    this.cy = cy;
    this.bindEvents(cy);

    // Initial fit with padding
    setTimeout(() => {
      cy.fit(undefined, 50);
      const loader = document.getElementById('graph-loader');
      if (loader) {
        loader.classList.add('hidden');
      }
    }, 150);

    return cy;
  }

  private bindEvents(cy: Core) {
    // Tap on Node
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular;
      this.selectNode(node);
    });

    // Tap on Edge
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target as EdgeSingular;
      this.selectEdge(edge);
    });

    // Tap on Canvas Background (clear selection)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        this.clearSelection();
      }
    });
  }

  public selectNode(node: NodeSingular) {
    if (!this.cy) return;
    const cy = this.cy;

    cy.batch(() => {
      cy.elements().removeClass('selected highlighted faded');
      node.addClass('selected');

      const neighborhood = node.closedNeighborhood();
      neighborhood.addClass('highlighted');

      cy.elements().not(neighborhood).addClass('faded');
    });

    const nodeId = node.id();
    const nodeData = this.nodeMap.get(nodeId);
    if (!nodeData) return;

    const incoming = this.dataset.aristas.filter((e) => e.destino === nodeId);
    const outgoing = this.dataset.aristas.filter((e) => e.origen === nodeId);

    const payload: NodeDrawerPayload = {
      id: nodeData.id,
      nombre: nodeData.nombre,
      sigla: nodeData.sigla,
      tipo: nodeData.tipo,
      dependencia: nodeData.dependencia,
      rol_ecosistema: nodeData.rol_ecosistema,
      sitio_web: nodeData.sitio_web,
      nivel_madurez_digital: nodeData.nivel_madurez_digital,
      estado_adopcion_ley21180: nodeData.estado_adopcion_ley21180,
      total_conexiones: incoming.length + outgoing.length,
      in_degree: incoming.length,
      out_degree: outgoing.length,
      aristas_entrantes: incoming.map((e) => ({ id: e.id, origen: e.origen, bus: e.plataforma_o_bus })),
      aristas_salientes: outgoing.map((e) => ({ id: e.id, destino: e.destino, bus: e.plataforma_o_bus })),
    };

    window.dispatchEvent(
      new CustomEvent<SelectionEventDetail>('selection-changed', {
        detail: { type: 'node', data: payload, payload },
      })
    );
  }

  public selectEdge(edge: EdgeSingular) {
    if (!this.cy) return;
    const cy = this.cy;

    cy.batch(() => {
      cy.elements().removeClass('selected highlighted faded');
      edge.addClass('selected');

      const endpoints = edge.connectedNodes();
      endpoints.addClass('highlighted');

      cy.elements().not(edge).not(endpoints).addClass('faded');
    });

    const edgeId = edge.id();
    const edgeData = this.edgeMap.get(edgeId);
    if (!edgeData) return;

    const origenNode = this.nodeMap.get(edgeData.origen);
    const destinoNode = this.nodeMap.get(edgeData.destino);

    const payload: EdgeDrawerPayload = {
      id: edgeData.id,
      origen_id: edgeData.origen,
      origen_sigla: origenNode?.sigla || edgeData.origen,
      origen_nombre: origenNode?.nombre || edgeData.origen,
      destino_id: edgeData.destino,
      destino_sigla: destinoNode?.sigla || edgeData.destino,
      destino_nombre: destinoNode?.nombre || edgeData.destino,
      plataforma_o_bus: edgeData.plataforma_o_bus,
      tipo_dato: edgeData.tipo_dato,
      estandar_o_protocolo: edgeData.estandar_o_protocolo,
      nivel_apertura: edgeData.nivel_apertura,
      fuente_oficial_url: edgeData.fuente_oficial_url,
      brecha_observada: edgeData.brecha_observada,
      frecuencia_actualizacion: edgeData.frecuencia_actualizacion,
      base_legal: edgeData.base_legal || 'Ley N° 21.180',
    };

    window.dispatchEvent(
      new CustomEvent<SelectionEventDetail>('selection-changed', {
        detail: { type: 'edge', data: payload, payload },
      })
    );
  }

  public clearSelection() {
    if (!this.cy) return;
    this.cy.batch(() => {
      this.cy!.elements().removeClass('selected highlighted faded');
    });

    window.dispatchEvent(
      new CustomEvent<SelectionEventDetail>('selection-changed', {
        detail: { type: 'none', data: null, payload: null },
      })
    );
  }

  public zoomIn() {
    if (!this.cy) return;
    const current = this.cy.zoom();
    this.cy.animate({
      zoom: current * 1.3,
      duration: 200,
    });
  }

  public zoomOut() {
    if (!this.cy) return;
    const current = this.cy.zoom();
    this.cy.animate({
      zoom: current * 0.77,
      duration: 200,
    });
  }

  public fitViewport() {
    if (!this.cy) return;
    this.cy.animate({
      fit: { eles: this.cy.elements(':visible'), padding: 50 },
      duration: 300,
    });
  }

  public resetLayout() {
    if (!this.cy) return;
    const layout = this.cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 600,
      componentSpacing: 90,
      nodeRepulsion: () => 450000,
      nodeOverlap: 25,
      idealEdgeLength: () => 130,
      edgeElasticity: () => 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      padding: 50,
    });
    layout.run();
  }

  public focusNode(nodeId: string) {
    if (!this.cy) return;
    const node = this.cy.getElementById(nodeId);
    if (node && node.length > 0) {
      this.selectNode(node);
      this.cy.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 350,
      });
    }
  }

  public applyFilters(filters: Partial<FilterState>) {
    this.filters = { ...this.filters, ...filters };
    if (!this.cy) return;

    const { search = '', typologies = [], protocols = [], onlyGaps = false } = this.filters;
    const normalizedQuery = search.trim().toLowerCase();

    // 1. Filter Nodes
    const matchedNodes = this.dataset.nodos.filter((node) => {
      if (normalizedQuery.length > 0) {
        const matchName = node.nombre.toLowerCase().includes(normalizedQuery);
        const matchSigla = node.sigla.toLowerCase().includes(normalizedQuery);
        const matchId = node.id.toLowerCase().includes(normalizedQuery);
        if (!matchName && !matchSigla && !matchId) {
          return false;
        }
      }

      if (typologies.length > 0) {
        if (!typologies.includes(node.tipo)) {
          return false;
        }
      }

      return true;
    });

    const matchedNodeIds = new Set(matchedNodes.map((n) => n.id));

    // 2. Filter Edges
    const matchedEdges = this.dataset.aristas.filter((edge) => {
      if (onlyGaps) {
        if (!edge.brecha_observada || edge.brecha_observada.trim().length === 0) {
          return false;
        }
      }

      if (protocols.length > 0) {
        if (!protocols.includes(edge.estandar_o_protocolo)) {
          return false;
        }
      }

      return matchedNodeIds.has(edge.origen) && matchedNodeIds.has(edge.destino);
    });

    const activeEdgeIds = new Set(matchedEdges.map((e) => e.id));

    // Refine active nodes
    const activeNodes = matchedNodes.filter((node) => {
      if (typologies.length > 0 || normalizedQuery.length > 0) {
        return true;
      }
      if (protocols.length > 0 || onlyGaps) {
        return matchedEdges.some((e) => e.origen === node.id || e.destino === node.id);
      }
      return true;
    });

    const activeNodeIds = new Set(activeNodes.map((n) => n.id));

    // Apply visibility in Cytoscape
    this.cy.batch(() => {
      this.cy!.nodes().forEach((n) => {
        if (activeNodeIds.has(n.id())) {
          n.removeClass('hidden');
          n.style('display', 'element');
        } else {
          n.addClass('hidden');
          n.style('display', 'none');
        }
      });

      this.cy!.edges().forEach((e) => {
        if (activeEdgeIds.has(e.id())) {
          e.removeClass('hidden');
          e.style('display', 'element');
        } else {
          e.addClass('hidden');
          e.style('display', 'none');
        }
      });
    });

    // If a single node is isolated by search, focus it
    if (normalizedQuery.length > 0 && activeNodes.length === 1) {
      const target = this.cy.getElementById(activeNodes[0].id);
      if (target.length > 0) {
        this.selectNode(target);
        this.cy.animate({
          center: { eles: target },
          zoom: 1.4,
          duration: 300,
        });
      }
    }

    // Dispatch filter state change event for header KPI updates
    window.dispatchEvent(
      new CustomEvent('filters-updated', {
        detail: {
          activeNodesCount: activeNodes.length,
          activeEdgesCount: matchedEdges.length,
          activeNodeIds: Array.from(activeNodeIds),
          activeEdgeIds: Array.from(activeEdgeIds),
        },
      })
    );
  }

  public resetFilters() {
    this.filters = {
      search: '',
      typologies: [],
      protocols: [],
      onlyGaps: false,
    };
    if (!this.cy) return;

    this.cy.batch(() => {
      this.cy!.elements().removeClass('hidden faded selected highlighted');
      this.cy!.elements().style('display', 'element');
    });

    window.dispatchEvent(
      new CustomEvent('filters-updated', {
        detail: {
          activeNodesCount: this.dataset.nodos.length,
          activeEdgesCount: this.dataset.aristas.length,
          activeNodeIds: this.dataset.nodos.map((n) => n.id),
          activeEdgeIds: this.dataset.aristas.map((e) => e.id),
        },
      })
    );
  }
}

/**
 * Global initialization helper for Astro Island
 */
export function initGraphApp(dataset: DatasetInteroperabilidad): GraphController {
  const container = document.getElementById('cy');
  if (!container) {
    throw new Error('Cytoscape mount element #cy not found in DOM.');
  }

  const controller = new GraphController(dataset);
  controller.init(container);

  // HUD Controls binding (supports both id and data-action selectors for E2E contract compliance)
  const zoomInBtns = document.querySelectorAll('#hud-zoom-in, [data-action="zoom-in"]');
  zoomInBtns.forEach((btn) => btn.addEventListener('click', () => controller.zoomIn()));

  const zoomOutBtns = document.querySelectorAll('#hud-zoom-out, [data-action="zoom-out"]');
  zoomOutBtns.forEach((btn) => btn.addEventListener('click', () => controller.zoomOut()));

  const fitBtns = document.querySelectorAll('#hud-fit, [data-action="fit"]');
  fitBtns.forEach((btn) => btn.addEventListener('click', () => controller.fitViewport()));

  const resetBtns = document.querySelectorAll('#hud-reset, [data-action="reset"]');
  resetBtns.forEach((btn) => btn.addEventListener('click', () => controller.resetLayout()));

  // Search input binding
  const searchInputs = document.querySelectorAll<HTMLInputElement>('input[name="search"], #search-input');
  searchInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      controller.applyFilters({ search: val });
    });
  });

  // Filter controls binding
  const typologySelects = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    '[data-filter="typology"], #filter-typology'
  );
  typologySelects.forEach((elem) => {
    elem.addEventListener('change', () => {
      const selected = Array.from(typologySelects)
        .filter((el) => (el as HTMLInputElement).checked)
        .map((el) => (el as HTMLInputElement).value as TipoNodo);
      controller.applyFilters({ typologies: selected });
    });
  });

  const protocolSelects = document.querySelectorAll<HTMLSelectElement | HTMLInputElement>(
    '[data-filter="protocol"], #filter-protocol'
  );
  protocolSelects.forEach((elem) => {
    elem.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      const protocols = val ? [val as EstandarProtocolo] : [];
      controller.applyFilters({ protocols });
    });
  });

  const gapsToggles = document.querySelectorAll<HTMLInputElement>(
    '[data-filter="onlyGaps"], #filter-gaps'
  );
  gapsToggles.forEach((toggle) => {
    toggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      controller.applyFilters({ onlyGaps: checked });
    });
  });

  // Reset Filters button
  const resetFiltersBtns = document.querySelectorAll('#reset-filters, [data-action="reset-filters"]');
  resetFiltersBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Uncheck checkboxes & reset inputs
      searchInputs.forEach((i) => (i.value = ''));
      typologySelects.forEach((t) => ((t as HTMLInputElement).checked = false));
      protocolSelects.forEach((p) => ((p as HTMLSelectElement).value = ''));
      gapsToggles.forEach((g) => (g.checked = false));
      controller.resetFilters();
    });
  });

  // Expose controller globally for client scripts & E2E inspection
  (window as unknown as { __graphController?: GraphController }).__graphController = controller;

  return controller;
}
