/**
 * Challenger Adversarial Stress Suite for Milestone 1 (P029)
 * Author: teamwork_preview_challenger_m1_1
 * 
 * Hostile stress tests verifying:
 * 1. Rejection of orphan nodes with specific error messaging.
 * 2. Rejection of dangling/broken edge references (non-existent origin and destination).
 * 3. Rejection of non-HTTP(S) schemes (ftp://, javascript:, file://, data:).
 * 4. Rejection of duplicate node IDs and duplicate edge IDs.
 * 5. Rejection of invalid slug identifiers (spaces, uppercase, non-alphanumeric).
 * 6. Rejection of invalid enum values (node typology, maturity level, protocol).
 * 7. Rejection of undersized datasets (< 10 nodes, < 12 edges).
 * 8. Rejection of shallow/trivial gap diagnoses (< 10 chars).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarDatasetInteroperabilidad } from '../../scripts/validate-data.js';
import type {
  DatasetInteroperabilidad,
  NodoInstitucion,
  AristaInteroperabilidad,
  TipoNodo,
  EstandarProtocolo,
} from '../../src/types/interoperabilidad.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getCleanDataset(): DatasetInteroperabilidad {
  const jsonPath = resolve(__dirname, '../../src/data/interoperabilidad.json');
  return JSON.parse(readFileSync(jsonPath, 'utf-8'));
}

describe('Challenger Adversarial Stress Suite (Empirical Verification)', () => {
  // 1. Injected orphan node must fail
  test('ADV-01: Injected orphan node causes failure with exit flag false and explicit message', () => {
    const data = getCleanDataset();
    const orphan: NodoInstitucion = {
      id: 'adversarial-orphan-node',
      nombre: 'Entidad Fantasma Aislada',
      sigla: 'EFA',
      tipo: 'servicio_publico',
      dependencia: 'Ministerio de Hacienda',
      rol_ecosistema: 'Nodo de prueba sin aristas para provocar fallo de huerfano',
      sitio_web: 'https://hacienda.gob.cl',
      nivel_madurez_digital: 'medio',
      estado_adopcion_ley21180: 'fase_1_comunicaciones',
    };
    data.nodos.push(orphan);

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Dataset with orphan node must be marked invalid');
    const orphanReported = res.errores.some(
      (e) => e.includes('huérfanos') && e.includes('adversarial-orphan-node')
    );
    assert.ok(orphanReported, 'Must explicitly name the orphan node in errors');
  });

  // 2. Broken edge destination must fail
  test('ADV-02: Broken destination foreign key causes failure with explicit reference error', () => {
    const data = getCleanDataset();
    const brokenEdge: AristaInteroperabilidad = {
      id: 'broken-dest-edge',
      origen: 'sii',
      destino: 'non-existent-destination-target',
      plataforma_o_bus: 'Bus Central',
      tipo_dato: 'Certificados',
      estandar_o_protocolo: 'REST / JSON',
      nivel_apertura: 'Restringido interinstitucional',
      fuente_oficial_url: 'https://sii.cl',
      brecha_observada: 'Brecha sustantiva suficientemente documentada para el test',
      frecuencia_actualizacion: 'Batch diario',
    };
    data.aristas.push(brokenEdge);

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Dataset with broken destination reference must fail');
    const destError = res.errores.some(
      (e) => e.includes('non-existent-destination-target') && e.includes('destino')
    );
    assert.ok(destError, 'Must explicitly report broken destino foreign key');
  });

  // 3. Broken edge origin must fail
  test('ADV-03: Broken origin foreign key causes failure with explicit reference error', () => {
    const data = getCleanDataset();
    const brokenEdge: AristaInteroperabilidad = {
      id: 'broken-origin-edge',
      origen: 'non-existent-origin-source',
      destino: 'tgr',
      plataforma_o_bus: 'Bus Central',
      tipo_dato: 'Liquidaciones',
      estandar_o_protocolo: 'SFTP / Batch plano o CSV',
      nivel_apertura: 'Restringido interinstitucional',
      fuente_oficial_url: 'https://tgr.cl',
      brecha_observada: 'Brecha sustantiva suficientemente documentada para el test',
      frecuencia_actualizacion: 'Batch diario',
    };
    data.aristas.push(brokenEdge);

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Dataset with broken origin reference must fail');
    const originError = res.errores.some(
      (e) => e.includes('non-existent-origin-source') && e.includes('origen')
    );
    assert.ok(originError, 'Must explicitly report broken origen foreign key');
  });

  // 4. Invalid URL schemes: ftp://, javascript:, file://, data:
  test('ADV-04: Non-HTTP(S) schemes are rejected (ftp, javascript, file)', () => {
    const badSchemes = [
      'ftp://servidor.gob.cl/archivo.csv',
      'javascript:alert("xss")',
      'file:///C:/secrets.json',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'not-a-valid-url',
      '',
    ];

    for (const badUrl of badSchemes) {
      const data = getCleanDataset();
      data.aristas[0].fuente_oficial_url = badUrl;
      const res = validarDatasetInteroperabilidad(data);
      assert.equal(
        res.valido,
        false,
        `Expected validation failure for invalid URL scheme "${badUrl}"`
      );
      assert.ok(
        res.errores.some((e) => e.includes('fuente_oficial_url')),
        `Expected error mentioning fuente_oficial_url for "${badUrl}"`
      );
    }
  });

  // 5. Duplicate IDs detection
  test('ADV-05: Duplicate node ID is strictly detected and rejected', () => {
    const data = getCleanDataset();
    const dupNode: NodoInstitucion = {
      id: 'sii', // already exists
      nombre: 'Duplicado de SII',
      sigla: 'SIIDUP',
      tipo: 'servicio_publico',
      dependencia: 'Hacienda',
      rol_ecosistema: 'Nodo duplicado para verificar colisiones de clave primaria',
      sitio_web: 'https://sii.cl',
      nivel_madurez_digital: 'alto',
      estado_adopcion_ley21180: 'fase_3_interoperabilidad',
    };
    data.nodos.push(dupNode);

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Duplicate node ID must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes('ID duplicado detectado: "sii"')),
      'Must report duplicate ID error for "sii"'
    );
  });

  test('ADV-06: Duplicate edge ID is strictly detected and rejected', () => {
    const data = getCleanDataset();
    const firstEdgeId = data.aristas[0].id;
    const dupEdge: AristaInteroperabilidad = {
      ...data.aristas[0],
      // Same ID
    };
    data.aristas.push(dupEdge);

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Duplicate edge ID must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes(`ID duplicado detectado: "${firstEdgeId}"`)),
      `Must report duplicate edge ID error for "${firstEdgeId}"`
    );
  });

  // 6. Non-slug IDs
  test('ADV-07: Non-slug ID (spaces, uppercase, symbols) is rejected', () => {
    const invalidIds = ['SRCEI_UPPER', 'institucion con espacios', 'nodo@especial!', 'nodo#1'];
    for (const badId of invalidIds) {
      const data = getCleanDataset();
      data.nodos[0].id = badId;
      // also point first edge origin to badId so it doesn't fail on referential integrity
      data.aristas[0].origen = badId;

      const res = validarDatasetInteroperabilidad(data);
      assert.equal(res.valido, false, `ID "${badId}" should be rejected as invalid slug`);
      assert.ok(
        res.errores.some((e) => e.includes('ID inválido. Debe ser slug')),
        `Error for "${badId}" must indicate slug requirement`
      );
    }
  });

  // 7. Invalid enum values
  test('ADV-08: Unknown typology enum is rejected', () => {
    const data = getCleanDataset();
    // @ts-expect-error test invalid enum
    data.nodos[0].tipo = 'empresa_privada_desconocida';

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Unknown typology must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes('"tipo" inválido')),
      'Must report invalid node type'
    );
  });

  test('ADV-09: Unknown protocol enum is rejected', () => {
    const data = getCleanDataset();
    // @ts-expect-error test invalid enum
    data.aristas[0].estandar_o_protocolo = 'Corba / RMI Antiguo';

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Unknown protocol must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes('"estandar_o_protocolo" inválido')),
      'Must report invalid protocol'
    );
  });

  // 8. Shallow/trivial gap diagnoses (< 10 chars)
  test('ADV-10: Trivial gap diagnoses (< 10 characters) are rejected', () => {
    const data = getCleanDataset();
    data.aristas[0].brecha_observada = 'corta';

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Trivial gap diagnosis must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes('"brecha_observada" debe contener un diagnóstico sustantivo')),
      'Must enforce minimum 10 characters substantive diagnosis'
    );
  });

  // 9. Dataset quantitative bounds (< 10 nodes, < 12 edges)
  test('ADV-11: Dataset with insufficient nodes (< 10) is rejected', () => {
    const data = getCleanDataset();
    data.nodos = data.nodos.slice(0, 5); // only 5 nodes

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Fewer than 10 nodes must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes('Se esperaban al menos 10 nodos')),
      'Must report insufficient node count'
    );
  });

  test('ADV-12: Dataset with insufficient edges (< 12) is rejected', () => {
    const data = getCleanDataset();
    data.aristas = data.aristas.slice(0, 5); // only 5 edges

    const res = validarDatasetInteroperabilidad(data);
    assert.equal(res.valido, false, 'Fewer than 12 edges must be rejected');
    assert.ok(
      res.errores.some((e) => e.includes('Se esperaban al menos 12 aristas')),
      'Must report insufficient edge count'
    );
  });
});
