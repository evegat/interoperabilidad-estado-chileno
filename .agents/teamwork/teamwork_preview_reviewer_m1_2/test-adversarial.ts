import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validarDatasetInteroperabilidad } from '../../../scripts/validate-data.js';
import type { DatasetInteroperabilidad } from '../../../src/types/interoperabilidad.js';

const datasetPath = resolve(process.cwd(), 'src/data/interoperabilidad.json');
const datasetOriginal: DatasetInteroperabilidad = JSON.parse(readFileSync(datasetPath, 'utf-8'));

console.log('--- TEST 0: Baseline Valid Dataset ---');
const r0 = validarDatasetInteroperabilidad(datasetOriginal);
console.log('Baseline valido:', r0.valido);

console.log('--- TEST 1: Broken Reference (non-existent origin) ---');
const d1 = JSON.parse(JSON.stringify(datasetOriginal));
d1.aristas.push({
  id: 'broken-edge',
  origen: 'fantasma',
  destino: 'tgr',
  plataforma_o_bus: 'Bus X',
  tipo_dato: 'Dato X',
  estandar_o_protocolo: 'REST / JSON',
  nivel_apertura: 'Público',
  fuente_oficial_url: 'https://www.tgr.cl',
  brecha_observada: 'Brecha de prueba para verificar fallo',
  frecuencia_actualizacion: 'Batch diario'
});
const r1 = validarDatasetInteroperabilidad(d1);
console.log('Broken ref rejected:', !r1.valido && r1.errores.some(e => e.includes('fantasma')));

console.log('--- TEST 2: Orphan Node (Isolated node) ---');
const d2 = JSON.parse(JSON.stringify(datasetOriginal));
d2.nodos.push({
  id: 'huerfano',
  nombre: 'Servicio Aislado de Prueba',
  sigla: 'SAP',
  tipo: 'servicio_publico',
  dependencia: 'Ministerio de Hacienda',
  rol_ecosistema: 'Rol de prueba aislado',
  sitio_web: 'https://www.hacienda.cl',
  nivel_madurez_digital: 'bajo',
  estado_adopcion_ley21180: 'rezagado'
});
const r2 = validarDatasetInteroperabilidad(d2);
console.log('Orphan node rejected:', !r2.valido && r2.errores.some(e => e.includes('huérfanos')));

console.log('--- TEST 3: Invalid URL Protocol (ftp://) ---');
const d3 = JSON.parse(JSON.stringify(datasetOriginal));
d3.aristas[0].fuente_oficial_url = 'ftp://invalid-url.com';
const r3 = validarDatasetInteroperabilidad(d3);
console.log('Invalid URL rejected:', !r3.valido && r3.errores.some(e => e.includes('fuente_oficial_url')));

console.log('--- TEST 4: Duplicate Node ID ---');
const d4 = JSON.parse(JSON.stringify(datasetOriginal));
d4.nodos.push({ ...d4.nodos[0] });
const r4 = validarDatasetInteroperabilidad(d4);
console.log('Duplicate node ID rejected:', !r4.valido && r4.errores.some(e => e.includes('duplicado')));

console.log('--- TEST 5: Short Brecha Description (<10 chars) ---');
const d5 = JSON.parse(JSON.stringify(datasetOriginal));
d5.aristas[0].brecha_observada = 'corta';
const r5 = validarDatasetInteroperabilidad(d5);
console.log('Short brecha rejected:', !r5.valido && r5.errores.some(e => e.includes('brecha_observada')));

console.log('--- ALL ADVERSARIAL TESTS COMPLETED ---');
