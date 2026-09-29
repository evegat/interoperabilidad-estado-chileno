/**
 * Tier 3: Cross-Feature Combinations E2E Tests
 * Derived from ORIGINAL_REQUEST.md (§R3) and PROJECT.md Feature Interactions.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCanonicalDataset, simulateGraphFilter } from './test-helpers.js';
import type {
  NodoInstitucion,
  AristaInteroperabilidad,
} from '../../src/types/interoperabilidad.js';

describe('Tier 3: Cross-Feature Combinations (Filters, Search & Drawer Synchronization)', () => {
  const dataset = loadCanonicalDataset();

  // --------------------------------------------------------------------------
  // CF1: Typology Filter + Free Text Search Concurrency
  // --------------------------------------------------------------------------
  test('T3.1 - Concurrently filtering by typology and searching free text isolates exact target', () => {
    // Scenario: User selects 'servicio_publico' and types "Impuestos" in search
    const result = simulateGraphFilter(dataset, {
      typologies: ['servicio_publico'],
      search: 'Impuestos',
    });

    assert.equal(result.activeNodes.length, 1, 'Should isolate exactly 1 node (SII)');
    assert.equal(result.activeNodes[0].id, 'sii', 'Isolated node must be SII');
    assert.equal(result.activeNodes[0].sigla, 'SII');

    // Incident edges should be accessible through graph relationships
    const incidentEdges = dataset.aristas.filter(
      (e) => e.origen === 'sii' || e.destino === 'sii'
    );
    assert.ok(incidentEdges.length >= 3, 'SII must have at least 3 incident edges in dataset');
  });

  // --------------------------------------------------------------------------
  // CF2: Protocol Filter + Observed Gaps Toggle Interaction
  // --------------------------------------------------------------------------
  test('T3.2 - Protocol filter combined with observed gaps toggle returns accurate subset', () => {
    // Scenario: User filters by 'SFTP / Batch plano o CSV' AND enables 'onlyGaps'
    const result = simulateGraphFilter(dataset, {
      protocols: ['SFTP / Batch plano o CSV'],
      onlyGaps: true,
    });

    assert.ok(
      result.activeEdges.length > 0,
      'Must return active edges matching SFTP and having observed gaps'
    );

    // Verify every active edge satisfies both conditions
    for (const edge of result.activeEdges) {
      assert.equal(
        edge.estandar_o_protocolo,
        'SFTP / Batch plano o CSV',
        'Edge must match selected protocol'
      );
      assert.ok(
        edge.brecha_observada && edge.brecha_observada.trim().length >= 10,
        'Edge must contain substantive observed gap'
      );
    }

    // Verify that non-matching protocol edges are marked hidden
    assert.ok(result.hiddenEdgeIds.size > 0, 'Non-matching edges must be in hidden set');
  });

  // --------------------------------------------------------------------------
  // CF3: Node Selection Event -> Detail Drawer Payload Completeness
  // --------------------------------------------------------------------------
  test('T3.3 - Node selection generates complete institutional technical sheet payload', () => {
    // Contract definition for Drawer institutional sheet
    function buildNodeDrawerPayload(node: NodoInstitucion, allEdges: AristaInteroperabilidad[]) {
      const incoming = allEdges.filter((e) => e.destino === node.id);
      const outgoing = allEdges.filter((e) => e.origen === node.id);

      return {
        id: node.id,
        nombre: node.nombre,
        sigla: node.sigla,
        tipo: node.tipo,
        dependencia: node.dependencia,
        rol_ecosistema: node.rol_ecosistema,
        sitio_web: node.sitio_web,
        nivel_madurez_digital: node.nivel_madurez_digital,
        estado_adopcion_ley21180: node.estado_adopcion_ley21180,
        total_conexiones: incoming.length + outgoing.length,
        in_degree: incoming.length,
        out_degree: outgoing.length,
        aristas_entrantes: incoming.map((e) => ({ id: e.id, origen: e.origen, bus: e.plataforma_o_bus })),
        aristas_salientes: outgoing.map((e) => ({ id: e.id, destino: e.destino, bus: e.plataforma_o_bus })),
      };
    }

    for (const node of dataset.nodos) {
      const payload = buildNodeDrawerPayload(node, dataset.aristas);

      assert.ok(payload.id, 'Payload id must not be empty');
      assert.ok(payload.nombre, 'Payload nombre must not be empty');
      assert.ok(payload.sigla, 'Payload sigla must not be empty');
      assert.ok(payload.tipo, 'Payload tipo must not be empty');
      assert.ok(payload.dependencia, 'Payload dependencia must not be empty');
      assert.ok(payload.rol_ecosistema, 'Payload rol_ecosistema must not be empty');
      assert.match(payload.sitio_web, /^https?:\/\//, 'Payload sitio_web must be valid URL');
      assert.ok(payload.total_conexiones >= 1, `Node ${node.id} must have >= 1 connection`);
    }
  });

  // --------------------------------------------------------------------------
  // CF4: Edge Selection Event -> Detail Drawer Payload Completeness
  // --------------------------------------------------------------------------
  test('T3.4 - Edge selection generates complete interoperability flow payload', () => {
    const nodesMap = new Map(dataset.nodos.map((n) => [n.id, n]));

    function buildEdgeDrawerPayload(edge: AristaInteroperabilidad) {
      const origenNode = nodesMap.get(edge.origen);
      const destinoNode = nodesMap.get(edge.destino);

      return {
        id: edge.id,
        origen_id: edge.origen,
        origen_sigla: origenNode?.sigla || edge.origen,
        origen_nombre: origenNode?.nombre || edge.origen,
        destino_id: edge.destino,
        destino_sigla: destinoNode?.sigla || edge.destino,
        destino_nombre: destinoNode?.nombre || edge.destino,
        plataforma_o_bus: edge.plataforma_o_bus,
        tipo_dato: edge.tipo_dato,
        estandar_o_protocolo: edge.estandar_o_protocolo,
        nivel_apertura: edge.nivel_apertura,
        fuente_oficial_url: edge.fuente_oficial_url,
        brecha_observada: edge.brecha_observada,
        frecuencia_actualizacion: edge.frecuencia_actualizacion,
        base_legal: edge.base_legal || 'Ley N° 21.180',
      };
    }

    for (const edge of dataset.aristas) {
      const payload = buildEdgeDrawerPayload(edge);

      assert.ok(payload.id, 'Edge payload must have id');
      assert.ok(payload.origen_sigla, 'Edge payload must resolve origen_sigla');
      assert.ok(payload.destino_sigla, 'Edge payload must resolve destino_sigla');
      assert.ok(payload.plataforma_o_bus, 'Edge payload must describe plataforma_o_bus');
      assert.ok(payload.tipo_dato, 'Edge payload must describe tipo_dato');
      assert.ok(payload.estandar_o_protocolo, 'Edge payload must describe protocol');
      assert.match(payload.fuente_oficial_url, /^https?:\/\//, 'Edge payload must provide official URL');
      assert.ok(payload.brecha_observada.length >= 10, 'Edge payload must contain observed gap');
    }
  });

  // --------------------------------------------------------------------------
  // CF5: Filter Reset State Restoration
  // --------------------------------------------------------------------------
  test('T3.5 - Resetting filters restores 100% of nodes and edges to active visible state', () => {
    // First, apply restrictive filter
    const filtered = simulateGraphFilter(dataset, {
      typologies: ['gobierno_local'],
    });
    assert.ok(filtered.activeNodes.length < dataset.nodos.length);

    // Then, reset filter
    const resetResult = simulateGraphFilter(dataset, {});

    assert.equal(
      resetResult.activeNodes.length,
      dataset.nodos.length,
      'Reset must restore all nodes'
    );
    assert.equal(
      resetResult.activeEdges.length,
      dataset.aristas.length,
      'Reset must restore all edges'
    );
    assert.equal(resetResult.hiddenNodeIds.size, 0, 'No nodes should remain hidden');
    assert.equal(resetResult.hiddenEdgeIds.size, 0, 'No edges should remain hidden');
  });
});
