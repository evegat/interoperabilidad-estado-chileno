/**
 * Tier 2: Boundary & Corner Cases E2E Tests (Adversarial & Graph Theory Integrity)
 * Derived from ORIGINAL_REQUEST.md (§R2) and Graph Integrity Specifications.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCanonicalDataset,
  deepClone,
  simulateGraphFilter,
} from './test-helpers.js';
import { validarDatasetInteroperabilidad } from '../../scripts/validate-data.js';
import type { NodoInstitucion, AristaInteroperabilidad } from '../../src/types/interoperabilidad.js';

describe('Tier 2: Boundary & Corner Cases (Graph Integrity & Adversarial Rejection)', () => {
  // --------------------------------------------------------------------------
  // B1: Orphan Node Detection (Adversarial Mutation)
  // --------------------------------------------------------------------------
  test('T2.1 - Orphan node detection rejects isolated node with degree 0', () => {
    const dataset = deepClone(loadCanonicalDataset());

    const orphanNode: NodoInstitucion = {
      id: 'institucion-huerfana-test',
      nombre: 'Subsecretaría Aislada Sin Integraciones',
      sigla: 'SASI',
      tipo: 'ministerio',
      dependencia: 'Poder Ejecutivo',
      rol_ecosistema: 'Organismo de prueba aislado sin flujos de datos',
      sitio_web: 'https://www.gob.cl',
      nivel_madurez_digital: 'bajo',
      estado_adopcion_ley21180: 'rezagado',
    };

    dataset.nodos.push(orphanNode);

    const result = validarDatasetInteroperabilidad(dataset);

    assert.equal(result.valido, false, 'Validator must reject dataset containing orphan node');
    const hasOrphanError = result.errores.some(
      (err) => err.includes('institucion-huerfana-test') && err.toLowerCase().includes('huérfano')
    );
    assert.ok(hasOrphanError, 'Error messages must explicitly flag the orphan node');
  });

  // --------------------------------------------------------------------------
  // B2: Broken Link / Dangling Foreign Key Reference Detection
  // --------------------------------------------------------------------------
  test('T2.2 - Referential integrity rejects edge with non-existent target (destino)', () => {
    const dataset = deepClone(loadCanonicalDataset());

    const brokenEdge: AristaInteroperabilidad = {
      id: 'srcei-destino-inexistente-test',
      origen: 'srcei',
      destino: 'organismo-fantasma-xyz',
      plataforma_o_bus: 'Gateway Simulado',
      tipo_dato: 'Datos de prueba',
      estandar_o_protocolo: 'REST / JSON',
      nivel_apertura: 'Restringido interinstitucional',
      fuente_oficial_url: 'https://digital.gob.cl',
      brecha_observada: 'Brecha de prueba con texto suficientemente largo',
      frecuencia_actualizacion: 'Tiempo real / sincrónico',
    };

    dataset.aristas.push(brokenEdge);

    const result = validarDatasetInteroperabilidad(dataset);

    assert.equal(result.valido, false, 'Validator must fail when edge references non-existent target');
    const hasBrokenTargetError = result.errores.some(
      (err) => err.includes('organismo-fantasma-xyz') && err.includes('destino')
    );
    assert.ok(hasBrokenTargetError, 'Error messages must specify the broken destino foreign key');
  });

  test('T2.3 - Referential integrity rejects edge with non-existent origin (origen)', () => {
    const dataset = deepClone(loadCanonicalDataset());

    const brokenEdge: AristaInteroperabilidad = {
      id: 'origen-fantasma-tgr-test',
      origen: 'entidad-inexistente-abc',
      destino: 'tgr',
      plataforma_o_bus: 'Gateway Simulado',
      tipo_dato: 'Datos de prueba',
      estandar_o_protocolo: 'REST / JSON',
      nivel_apertura: 'Restringido interinstitucional',
      fuente_oficial_url: 'https://digital.gob.cl',
      brecha_observada: 'Brecha de prueba con texto suficientemente largo',
      frecuencia_actualizacion: 'Tiempo real / sincrónico',
    };

    dataset.aristas.push(brokenEdge);

    const result = validarDatasetInteroperabilidad(dataset);

    assert.equal(result.valido, false, 'Validator must fail when edge references non-existent origin');
    const hasBrokenOriginError = result.errores.some(
      (err) => err.includes('entidad-inexistente-abc') && err.includes('origen')
    );
    assert.ok(hasBrokenOriginError, 'Error messages must specify the broken origen foreign key');
  });

  // --------------------------------------------------------------------------
  // B3: Malformed Official URL Rejection
  // --------------------------------------------------------------------------
  test('T2.4 - URL validation rejects non-HTTP/HTTPS schemes and invalid syntax', () => {
    const dataset = deepClone(loadCanonicalDataset());

    // Corrupt an edge URL with ftp scheme
    dataset.aristas[0].fuente_oficial_url = 'ftp://servidor-inseguro.gob.cl/archivo.xml';

    const result = validarDatasetInteroperabilidad(dataset);

    assert.equal(result.valido, false, 'Validator must reject non-HTTP/HTTPS URLs');
    const hasUrlError = result.errores.some((err) => err.includes('fuente_oficial_url'));
    assert.ok(hasUrlError, 'Error messages must report malformed URL');
  });

  // --------------------------------------------------------------------------
  // B4: Empty & Special Characters Search Handling
  // --------------------------------------------------------------------------
  test('T2.5 - Filter engine handles empty query, whitespace, and special regex characters', () => {
    const dataset = loadCanonicalDataset();

    // 1. Empty string returns all nodes
    const emptyResult = simulateGraphFilter(dataset, { search: '' });
    assert.equal(emptyResult.activeNodes.length, dataset.nodos.length);

    // 2. Whitespace-only query returns all nodes
    const whitespaceResult = simulateGraphFilter(dataset, { search: '    ' });
    assert.equal(whitespaceResult.activeNodes.length, dataset.nodos.length);

    // 3. Special regex characters do not crash the search engine
    assert.doesNotThrow(() => {
      const specialResult = simulateGraphFilter(dataset, { search: '.*+?^${}()|[]\\' });
      assert.ok(Array.isArray(specialResult.activeNodes));
    }, 'Search filter must not throw regex parsing exception on special characters');

    // 4. Case insensitivity and diacritics robustness
    const lowerResult = simulateGraphFilter(dataset, { search: 'civil' });
    const upperResult = simulateGraphFilter(dataset, { search: 'CIVIL' });
    assert.equal(lowerResult.activeNodes.length, upperResult.activeNodes.length);
    assert.ok(lowerResult.activeNodes.some((n) => n.id === 'srcei'));
  });

  // --------------------------------------------------------------------------
  // B5: Contradictory & Extreme Filter Combinations
  // --------------------------------------------------------------------------
  test('T2.6 - Extreme filter combination yields clean empty state without exceptions', () => {
    const dataset = loadCanonicalDataset();

    // Typology 'superintendencia' + Protocol 'SFTP / Batch plano o CSV'
    // (In reality, superintendencias use REST and Web Services; none use SFTP in this dataset)
    const extremeResult = simulateGraphFilter(dataset, {
      typologies: ['superintendencia'],
      protocols: ['SFTP / Batch plano o CSV'],
      onlyGaps: true,
    });

    // Active edges should be empty, and no crash should occur
    assert.equal(
      extremeResult.activeEdges.length,
      0,
      'Contradictory filters should return 0 active edges'
    );
    assert.ok(extremeResult.hiddenEdgeIds.size > 0, 'Edges must be hidden');
  });

  // --------------------------------------------------------------------------
  // B6: Self-referencing Loop Warning
  // --------------------------------------------------------------------------
  test('T2.7 - Self-referencing loop generates warning or diagnostic note', () => {
    const dataset = deepClone(loadCanonicalDataset());

    const loopEdge: AristaInteroperabilidad = {
      id: 'srcei-srcei-loop-test',
      origen: 'srcei',
      destino: 'srcei',
      plataforma_o_bus: 'Loop Interno',
      tipo_dato: 'Loop de prueba',
      estandar_o_protocolo: 'REST / JSON',
      nivel_apertura: 'Restringido interinstitucional',
      fuente_oficial_url: 'https://digital.gob.cl',
      brecha_observada: 'Brecha de prueba con texto suficientemente largo',
      frecuencia_actualizacion: 'Tiempo real / sincrónico',
    };

    dataset.aristas.push(loopEdge);

    const result = validarDatasetInteroperabilidad(dataset);
    const hasLoopNotice = result.advertencias.some(
      (adv) => adv.includes('autoreferencial') || adv.includes('srcei -> srcei')
    );
    assert.ok(hasLoopNotice, 'Validator must detect and warn about self-referencing loops');
  });
});
