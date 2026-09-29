#!/usr/bin/env tsx
/**
 * QA Validator & Graph Metrics Engine for Chilean State Interoperability Dataset (P029)
 * 
 * Verifies:
 * 1. Strict JSON schema conformance and mandatory field existence.
 * 2. Strict referential integrity (all origins and targets exist in nodes).
 * 3. Zero orphan nodes (every node participates in at least one edge).
 * 4. URL validity and structure for official sources and websites.
 * 5. Unique identifiers for nodes and edges.
 * 6. Top-tier topological metrics: graph density, degree centrality,
 *    and automated detection of critical hubs & bottlenecks.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type {
  DatasetInteroperabilidad,
  NodoInstitucion,
  AristaInteroperabilidad,
  MetricasGrafo,
  ResultadoValidacion,
  TipoNodo,
  MadurezDigital,
  EstadoLey21180,
  EstandarProtocolo,
  NivelApertura,
  FrecuenciaActualizacion,
  CentralidadNodo,
  CuelloDeBotella,
} from '../src/types/interoperabilidad.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constantes de dominio y enums válidos
const TIPOS_NODO_VALIDOS = new Set<TipoNodo>([
  'ministerio',
  'servicio_publico',
  'bus_transversal',
  'gobierno_local',
  'organo_autonomo',
  'superintendencia',
]);

const MADUREZ_DIGITAL_VALIDA = new Set<MadurezDigital>(['alto', 'medio', 'bajo']);

const ESTADOS_LEY_VALIDOS = new Set<EstadoLey21180>([
  'fase_1_comunicaciones',
  'fase_2_procedimientos',
  'fase_3_interoperabilidad',
  'rezagado',
]);

const ESTANDARES_VALIDOS = new Set<EstandarProtocolo>([
  'REST / JSON',
  'SOAP / XML (WSDL)',
  'OpenID Connect / OAuth2',
  'SFTP / Batch plano o CSV',
  'Webhooks / Event-driven',
  'Bilateral Propietario',
]);

const NIVELES_APERTURA_VALIDOS = new Set<NivelApertura>([
  'Público',
  'Restringido interinstitucional',
  'Reservado',
]);

const FRECUENCIAS_VALIDAS = new Set<FrecuenciaActualizacion>([
  'Tiempo real / sincrónico',
  'Near-real-time',
  'Batch diario',
  'Batch mensual',
  'A demanda / manual',
]);

const SLUG_REGEX = /^[a-z0-9_-]+$/;

/**
 * Validador sintáctico estricto de URLs
 */
function esUrlValida(urlStr: string): boolean {
  if (typeof urlStr !== 'string' || urlStr.trim() === '') return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Función principal de validación y extracción de métricas
 */
export function validarDatasetInteroperabilidad(dataset: DatasetInteroperabilidad): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];
  let reglasEvaluadas = 0;

  if (!dataset || typeof dataset !== 'object') {
    return {
      valido: false,
      total_reglas_evaluadas: 1,
      errores: ['El dataset proporcionado es nulo o no es un objeto válido.'],
      advertencias: [],
    };
  }

  // Regla 1: Estructura general de metadatos
  reglasEvaluadas++;
  if (!dataset.version || typeof dataset.version !== 'string') {
    errores.push('El dataset no posee un campo "version" válido.');
  }
  if (!dataset.fecha_actualizacion || typeof dataset.fecha_actualizacion !== 'string') {
    errores.push('El dataset no posee un campo "fecha_actualizacion" válido.');
  }
  if (!dataset.descripcion || typeof dataset.descripcion !== 'string' || dataset.descripcion.length < 10) {
    errores.push('El dataset no posee una "descripcion" válida de al menos 10 caracteres.');
  }
  if (!Array.isArray(dataset.nodos) || dataset.nodos.length < 10) {
    errores.push(`Se esperaban al menos 10 nodos, se encontraron: ${dataset.nodos?.length ?? 0}`);
  }
  if (!Array.isArray(dataset.aristas) || dataset.aristas.length < 12) {
    errores.push(`Se esperaban al menos 12 aristas, se encontraron: ${dataset.aristas?.length ?? 0}`);
  }

  // Si hay errores estructurales mayores, no continuar con grafos
  if (errores.length > 0 && (!Array.isArray(dataset.nodos) || !Array.isArray(dataset.aristas))) {
    return { valido: false, total_reglas_evaluadas: reglasEvaluadas, errores, advertencias };
  }

  // Regla 2: Unicidad e Integridad de Nodos
  reglasEvaluadas++;
  const nodosMap = new Map<string, NodoInstitucion>();
  const inDegreeMap = new Map<string, number>();
  const outDegreeMap = new Map<string, number>();

  for (let i = 0; i < dataset.nodos.length; i++) {
    const nodo = dataset.nodos[i];
    if (!nodo || typeof nodo !== 'object') {
      errores.push(`Nodo [${i}]: El elemento es nulo o no es un objeto.`);
      continue;
    }
    const prefix = `Nodo [${i}] (${nodo.id || 'sin-id'})`;

    if (!nodo.id || typeof nodo.id !== 'string' || !SLUG_REGEX.test(nodo.id)) {
      errores.push(`${prefix}: ID inválido. Debe ser slug [a-z0-9_-]+`);
    } else if (nodosMap.has(nodo.id)) {
      errores.push(`${prefix}: ID duplicado detectado: "${nodo.id}".`);
    } else {
      nodosMap.set(nodo.id, nodo);
      inDegreeMap.set(nodo.id, 0);
      outDegreeMap.set(nodo.id, 0);
    }

    if (!nodo.nombre || typeof nodo.nombre !== 'string' || nodo.nombre.trim().length < 3) {
      errores.push(`${prefix}: "nombre" debe tener al menos 3 caracteres.`);
    }

    if (!nodo.sigla || typeof nodo.sigla !== 'string' || nodo.sigla.trim().length < 2) {
      errores.push(`${prefix}: "sigla" debe tener al menos 2 caracteres.`);
    }

    if (!TIPOS_NODO_VALIDOS.has(nodo.tipo)) {
      errores.push(`${prefix}: "tipo" inválido: "${nodo.tipo}". Válidos: ${Array.from(TIPOS_NODO_VALIDOS).join(', ')}`);
    }

    if (!nodo.dependencia || typeof nodo.dependencia !== 'string' || nodo.dependencia.trim().length < 2) {
      errores.push(`${prefix}: "dependencia" obligatoria.`);
    }

    if (!nodo.rol_ecosistema || typeof nodo.rol_ecosistema !== 'string' || nodo.rol_ecosistema.trim().length < 5) {
      errores.push(`${prefix}: "rol_ecosistema" debe tener al menos 5 caracteres.`);
    }

    if (!nodo.sitio_web || !esUrlValida(nodo.sitio_web)) {
      errores.push(`${prefix}: "sitio_web" no es una URL http/https válida: "${nodo.sitio_web}"`);
    }

    if (!MADUREZ_DIGITAL_VALIDA.has(nodo.nivel_madurez_digital)) {
      errores.push(`${prefix}: "nivel_madurez_digital" inválido: "${nodo.nivel_madurez_digital}".`);
    }

    if (!ESTADOS_LEY_VALIDOS.has(nodo.estado_adopcion_ley21180)) {
      errores.push(`${prefix}: "estado_adopcion_ley21180" inválido: "${nodo.estado_adopcion_ley21180}".`);
    }
  }

  // Regla 3: Unicidad e Integridad de Aristas y Referencialidad
  reglasEvaluadas++;
  const aristasMap = new Map<string, AristaInteroperabilidad>();
  const paresConectados = new Map<string, number>();

  for (let i = 0; i < dataset.aristas.length; i++) {
    const arista = dataset.aristas[i];
    if (!arista || typeof arista !== 'object') {
      errores.push(`Arista [${i}]: El elemento es nulo o no es un objeto.`);
      continue;
    }
    const prefix = `Arista [${i}] (${arista.id || 'sin-id'})`;

    if (!arista.id || typeof arista.id !== 'string' || !SLUG_REGEX.test(arista.id)) {
      errores.push(`${prefix}: ID inválido. Debe ser slug [a-z0-9_-]+`);
    } else if (aristasMap.has(arista.id)) {
      errores.push(`${prefix}: ID duplicado detectado: "${arista.id}".`);
    } else {
      aristasMap.set(arista.id, arista);
    }

    // Integridad Referencial Estricta: Origen y Destino
    if (!arista.origen || typeof arista.origen !== 'string') {
      errores.push(`${prefix}: Falta el campo "origen".`);
    } else if (!nodosMap.has(arista.origen)) {
      errores.push(`${prefix}: Referencia rota en "origen": El nodo "${arista.origen}" no existe en nodos.`);
    } else {
      outDegreeMap.set(arista.origen, (outDegreeMap.get(arista.origen) || 0) + 1);
    }

    if (!arista.destino || typeof arista.destino !== 'string') {
      errores.push(`${prefix}: Falta el campo "destino".`);
    } else if (!nodosMap.has(arista.destino)) {
      errores.push(`${prefix}: Referencia rota en "destino": El nodo "${arista.destino}" no existe en nodos.`);
    } else {
      inDegreeMap.set(arista.destino, (inDegreeMap.get(arista.destino) || 0) + 1);
    }

    if (arista.origen && arista.destino && arista.origen === arista.destino) {
      advertencias.push(`${prefix}: Arista autoreferencial detectada (${arista.origen} -> ${arista.destino}).`);
    }

    if (arista.origen && arista.destino) {
      const parKey = `${arista.origen}->${arista.destino}`;
      const cuenta = (paresConectados.get(parKey) || 0) + 1;
      paresConectados.set(parKey, cuenta);
      if (cuenta > 1) {
        advertencias.push(`${prefix}: Flujo concurrente detectado entre "${arista.origen}" y "${arista.destino}" (instancia #${cuenta}).`);
      }
    }

    if (!arista.plataforma_o_bus || typeof arista.plataforma_o_bus !== 'string' || arista.plataforma_o_bus.trim().length < 2) {
      errores.push(`${prefix}: "plataforma_o_bus" obligatorio.`);
    }

    if (!arista.tipo_dato || typeof arista.tipo_dato !== 'string' || arista.tipo_dato.trim().length < 3) {
      errores.push(`${prefix}: "tipo_dato" obligatorio (min 3 chars).`);
    }

    if (!ESTANDARES_VALIDOS.has(arista.estandar_o_protocolo)) {
      errores.push(`${prefix}: "estandar_o_protocolo" inválido: "${arista.estandar_o_protocolo}".`);
    }

    if (!NIVELES_APERTURA_VALIDOS.has(arista.nivel_apertura)) {
      errores.push(`${prefix}: "nivel_apertura" inválido: "${arista.nivel_apertura}".`);
    }

    if (!arista.fuente_oficial_url || !esUrlValida(arista.fuente_oficial_url)) {
      errores.push(`${prefix}: "fuente_oficial_url" inválida: "${arista.fuente_oficial_url}".`);
    }

    if (!arista.brecha_observada || typeof arista.brecha_observada !== 'string' || arista.brecha_observada.trim().length < 10) {
      errores.push(`${prefix}: "brecha_observada" debe contener un diagnóstico sustantivo de al menos 10 caracteres.`);
    }

    if (!FRECUENCIAS_VALIDAS.has(arista.frecuencia_actualizacion)) {
      errores.push(`${prefix}: "frecuencia_actualizacion" inválida: "${arista.frecuencia_actualizacion}".`);
    }
  }

  // Regla 4: Zero Orphan Nodes (Sin Nodos Huérfanos)
  reglasEvaluadas++;
  const nodosHuerfanos: string[] = [];
  for (const [id, nodo] of nodosMap.entries()) {
    const inDeg = inDegreeMap.get(id) || 0;
    const outDeg = outDegreeMap.get(id) || 0;
    const totalDeg = inDeg + outDeg;
    if (totalDeg === 0) {
      nodosHuerfanos.push(`${nodo.sigla} (${id})`);
    }
  }

  if (nodosHuerfanos.length > 0) {
    errores.push(`Se detectaron nodos huérfanos sin ninguna relación entrante ni saliente: ${nodosHuerfanos.join(', ')}`);
  }

  // Regla 5: Cálculo de Métricas Topológicas
  reglasEvaluadas++;
  const V = nodosMap.size;
  const E = aristasMap.size;
  const maxAristasPosibles = V * (V - 1);
  const densidad = maxAristasPosibles > 0 ? E / maxAristasPosibles : 0;
  const densidadNoDirigida = maxAristasPosibles > 0 ? (2 * E) / maxAristasPosibles : 0;

  let sumaGrados = 0;
  const rankingCentralidad: CentralidadNodo[] = [];

  for (const [id, nodo] of nodosMap.entries()) {
    const inDeg = inDegreeMap.get(id) || 0;
    const outDeg = outDegreeMap.get(id) || 0;
    const totalDeg = inDeg + outDeg;
    sumaGrados += totalDeg;

    rankingCentralidad.push({
      id,
      sigla: nodo.sigla,
      nombre: nodo.nombre,
      tipo: nodo.tipo,
      grado_total: totalDeg,
      in_degree: inDeg,
      out_degree: outDeg,
    });
  }

  rankingCentralidad.sort((a, b) => b.grado_total - a.grado_total || b.in_degree - a.in_degree);

  const gradoPromedio = V > 0 ? sumaGrados / V : 0;

  // Distribución de Estándares
  const distribucionEstandares = {} as Record<EstandarProtocolo, number>;
  for (const est of ESTANDARES_VALIDOS) distribucionEstandares[est] = 0;
  for (const arista of dataset.aristas) {
    if (!arista || typeof arista !== 'object') continue;
    if (ESTANDARES_VALIDOS.has(arista.estandar_o_protocolo)) {
      distribucionEstandares[arista.estandar_o_protocolo]++;
    }
  }

  // Distribución de Apertura
  const distribucionApertura = {} as Record<NivelApertura, number>;
  for (const ap of NIVELES_APERTURA_VALIDOS) distribucionApertura[ap] = 0;
  for (const arista of dataset.aristas) {
    if (!arista || typeof arista !== 'object') continue;
    if (NIVELES_APERTURA_VALIDOS.has(arista.nivel_apertura)) {
      distribucionApertura[arista.nivel_apertura]++;
    }
  }

  // Distribución de Tipologías
  const distribucionTipologias = {} as Record<TipoNodo, number>;
  for (const t of TIPOS_NODO_VALIDOS) distribucionTipologias[t] = 0;
  for (const nodo of dataset.nodos) {
    if (!nodo || typeof nodo !== 'object') continue;
    if (TIPOS_NODO_VALIDOS.has(nodo.tipo)) {
      distribucionTipologias[nodo.tipo]++;
    }
  }

  // Distribución de Madurez
  const distribucionMadurez = {} as Record<MadurezDigital, number>;
  for (const m of MADUREZ_DIGITAL_VALIDA) distribucionMadurez[m] = 0;
  for (const nodo of dataset.nodos) {
    if (!nodo || typeof nodo !== 'object') continue;
    if (MADUREZ_DIGITAL_VALIDA.has(nodo.nivel_madurez_digital)) {
      distribucionMadurez[nodo.nivel_madurez_digital]++;
    }
  }

  // Detección Dinámica y Algorítmica de Cuellos de Botella y Hubs Críticos
  const cuellosDeBotella: CuelloDeBotella[] = [];

  // Mapear brechas y aristas incidentes por nodo para análisis topológico dinámico
  const brechasPorNodo = new Map<string, string[]>();
  const aristasEntrantesPorNodo = new Map<string, AristaInteroperabilidad[]>();
  const aristasSalientesPorNodo = new Map<string, AristaInteroperabilidad[]>();

  for (const id of nodosMap.keys()) {
    brechasPorNodo.set(id, []);
    aristasEntrantesPorNodo.set(id, []);
    aristasSalientesPorNodo.set(id, []);
  }

  for (const arista of dataset.aristas) {
    if (!arista || typeof arista !== 'object') continue;
    if (arista.origen && arista.destino) {
      if (aristasSalientesPorNodo.has(arista.origen)) {
        aristasSalientesPorNodo.get(arista.origen)!.push(arista);
      }
      if (aristasEntrantesPorNodo.has(arista.destino)) {
        aristasEntrantesPorNodo.get(arista.destino)!.push(arista);
      }

      if (arista.brecha_observada) {
        const origenSigla = nodosMap.get(arista.origen)?.sigla || arista.origen;
        const destinoSigla = nodosMap.get(arista.destino)?.sigla || arista.destino;
        if (brechasPorNodo.has(arista.origen)) {
          brechasPorNodo.get(arista.origen)!.push(`[SALIDA -> ${destinoSigla}] ${arista.brecha_observada}`);
        }
        if (brechasPorNodo.has(arista.destino)) {
          brechasPorNodo.get(arista.destino)!.push(`[ENTRADA <- ${origenSigla}] ${arista.brecha_observada}`);
        }
      }
    }
  }

  // Análisis topológico puramente algorítmico (sin slugs fijos ni listas blancas)
  for (const cent of rankingCentralidad) {
    // Criterio algorítmico: Nodos con grado superior al promedio, grado total alto (>= 3),
    // o buses centrales bidireccionales con grado >= 2.
    const esCandidato =
      cent.grado_total > gradoPromedio ||
      cent.grado_total >= 3 ||
      (cent.tipo === 'bus_transversal' && cent.grado_total >= 2 && cent.in_degree >= 1 && cent.out_degree >= 1);

    if (!esCandidato) {
      continue;
    }

    const entrantes = aristasEntrantesPorNodo.get(cent.id) || [];
    const salientes = aristasSalientesPorNodo.get(cent.id) || [];
    const brechas = brechasPorNodo.get(cent.id) || [];

    // Inspección dinámica de instituciones conectadas (vecindad)
    const incomingInstitutions = Array.from(
      new Set(entrantes.map((a) => nodosMap.get(a.origen)?.sigla || a.origen))
    );
    const outgoingInstitutions = Array.from(
      new Set(salientes.map((a) => nodosMap.get(a.destino)?.sigla || a.destino))
    );

    // Tipologías de instituciones enlazadas para detección de puentes intersectoriales
    const neighborTypologies = new Set<TipoNodo>();
    for (const a of entrantes) {
      const n = nodosMap.get(a.origen);
      if (n?.tipo) neighborTypologies.add(n.tipo);
    }
    for (const a of salientes) {
      const n = nodosMap.get(a.destino);
      if (n?.tipo) neighborTypologies.add(n.tipo);
    }

    // Protocolos y estándares de transporte utilizados
    const protocolsUsed = Array.from(
      new Set([
        ...entrantes.map((a) => a.estandar_o_protocolo),
        ...salientes.map((a) => a.estandar_o_protocolo),
      ])
    ).filter(Boolean);

    // Categorización estructural dinámica según ratios de in/out degree y diversidad topológica
    let rolCritico = '';
    if (cent.out_degree === 0 && cent.in_degree >= 2) {
      rolCritico = 'Sumidero / Concentrador de Integraciones y Datos';
    } else if (cent.in_degree === 0 && cent.out_degree >= 2) {
      rolCritico = 'Fuente Crítica / Emisor Transversal de Certificaciones e Identidad';
    } else if (neighborTypologies.size >= 3) {
      rolCritico = 'Conector Multitipo / Puente Intersectorial';
    } else if (cent.in_degree >= 1 && cent.out_degree >= 1) {
      rolCritico = 'Hub Articulador / Bus de Interoperabilidad Bidireccional';
    } else if (cent.in_degree >= 2 && cent.out_degree <= 1) {
      rolCritico = 'Sumidero / Concentrador de Integraciones y Datos';
    } else if (cent.out_degree >= 2 && cent.in_degree <= 1) {
      rolCritico = 'Fuente Crítica / Emisor Transversal de Certificaciones e Identidad';
    } else {
      rolCritico = 'Punto de Articulación Crítica';
    }

    // Construcción algorítmica y dinámica del motivo basada en la topología real
    const fragmentosMotivo: string[] = [];

    if (cent.in_degree > 0 && cent.out_degree > 0) {
      const inText = `${cent.in_degree} ${cent.in_degree === 1 ? 'entrante' : 'entrantes'}`;
      const outText = `${cent.out_degree} ${cent.out_degree === 1 ? 'saliente' : 'salientes'}`;
      fragmentosMotivo.push(`Concentra ${cent.grado_total} flujos activos (${inText}, ${outText})`);
    } else if (cent.in_degree > 0) {
      fragmentosMotivo.push(`Concentra ${cent.in_degree} ${cent.in_degree === 1 ? 'flujo entrante' : 'flujos entrantes'}`);
    } else if (cent.out_degree > 0) {
      fragmentosMotivo.push(`Concentra ${cent.out_degree} ${cent.out_degree === 1 ? 'flujo saliente crítico' : 'flujos salientes críticos'}`);
    }

    if (incomingInstitutions.length > 0) {
      fragmentosMotivo.push(`Recibe flujos de: ${incomingInstitutions.join(', ')}`);
    }
    if (outgoingInstitutions.length > 0) {
      fragmentosMotivo.push(`Emite flujos hacia: ${outgoingInstitutions.join(', ')}`);
    }
    if (protocolsUsed.length > 0) {
      fragmentosMotivo.push(`Protocolos de transporte: ${protocolsUsed.join(', ')}`);
    }

    const motivo = fragmentosMotivo.join('. ') + '.';

    cuellosDeBotella.push({
      id: cent.id,
      sigla: cent.sigla,
      nombre: cent.nombre,
      tipo: cent.tipo,
      grado_total: cent.grado_total,
      rol_critico: rolCritico,
      motivo,
      brechas_asociadas: brechas,
    });
  }

  const metricas: MetricasGrafo = {
    total_nodos: V,
    total_aristas: E,
    densidad: Number(densidad.toFixed(4)),
    densidad_no_dirigida: Number(densidadNoDirigida.toFixed(4)),
    grado_promedio: Number(gradoPromedio.toFixed(2)),
    ranking_centralidad: rankingCentralidad,
    cuellos_de_botella: cuellosDeBotella,
    distribucion_estandares: distribucionEstandares,
    distribucion_apertura: distribucionApertura,
    distribucion_tipologias: distribucionTipologias,
    distribucion_madurez: distribucionMadurez,
  };

  return {
    valido: errores.length === 0,
    total_reglas_evaluadas: reglasEvaluadas,
    errores,
    advertencias,
    metricas,
  };
}

/**
 * Presentación estética de métricas y validaciones en terminal
 */
function imprimirReporte(res: ResultadoValidacion): void {
  console.log('\n================================================================================');
  console.log('🏛️  QA VALIDATOR: GRAFO DE INTEROPERABILIDAD DEL ESTADO CHILENO (P029)');
  console.log('================================================================================\n');

  if (res.advertencias.length > 0) {
    console.log('⚠️  ADVERTENCIAS:');
    res.advertencias.forEach((adv) => console.log(`   - ${adv}`));
    console.log('');
  }

  if (!res.valido) {
    console.error('❌ ERRORES DE VALIDACIÓN ENCONTRADOS:');
    res.errores.forEach((err) => console.error(`   ✖ ${err}`));
    console.error(`\nTotal de errores: ${res.errores.length}`);
    console.error('================================================================================\n');
    return;
  }

  const m = res.metricas!;
  console.log('✅ ESTADO DEL DATASET: ÍNTEGRO Y VÁLIDO');
  console.log(`   - Reglas evaluadas: ${res.total_reglas_evaluadas} / ${res.total_reglas_evaluadas} aprobadas`);
  console.log(`   - Integridad referencial: 100% verificada (0 enlaces rotos)`);
  console.log(`   - Nodos huérfanos: 0 detectados (todos conectados con grado >= 1)`);
  console.log(`   - URLs oficiales: 100% verificadas sintácticamente (http/https)\n`);

  console.log('📊 RESUMEN TOPOLÓGICO DEL GRAFO:');
  console.log(`   • Vértices (Instituciones / Buses): ${m.total_nodos}`);
  console.log(`   • Aristas (Flujos de Interoperabilidad): ${m.total_aristas}`);
  console.log(`   • Densidad Dirigida: ${m.densidad} (${(m.densidad * 100).toFixed(2)}% del grafo completo)`);
  console.log(`   • Densidad No Dirigida: ${m.densidad_no_dirigida} (${(m.densidad_no_dirigida * 100).toFixed(2)}%)`);
  console.log(`   • Grado Promedio por Nodo: ${m.grado_promedio} conexiones\n`);

  console.log('🏆 RANKING DE CENTRALIDAD DE GRADO (TOP CONECTIVIDAD):');
  console.log('   -------------------------------------------------------------------------');
  console.log('   #   SIGLA           TIPO                  IN   OUT  TOTAL   ROL EN EL ECOSISTEMA');
  console.log('   -------------------------------------------------------------------------');
  m.ranking_centralidad.forEach((n, idx) => {
    const pos = String(idx + 1).padStart(2, ' ');
    const sigla = n.sigla.padEnd(14, ' ');
    const tipo = n.tipo.padEnd(20, ' ');
    const inDeg = String(n.in_degree).padStart(3, ' ');
    const outDeg = String(n.out_degree).padStart(4, ' ');
    const tot = String(n.grado_total).padStart(5, ' ');
    console.log(`   ${pos}. ${sigla} ${tipo} ${inDeg}  ${outDeg}  ${tot}   ${n.nombre.slice(0, 30)}...`);
  });
  console.log('   -------------------------------------------------------------------------\n');

  console.log('⚠️  CUELLOS DE BOTELLA Y PUNTOS DE ARTICULACIÓN CRÍTICA DETECTADOS:');
  m.cuellos_de_botella.forEach((cb, idx) => {
    console.log(`   ${idx + 1}. [${cb.sigla}] ${cb.rol_critico} (Grado: ${cb.grado_total})`);
    console.log(`      • Diagnóstico: ${cb.motivo}`);
  });
  console.log('');

  console.log('🔌 DISTRIBUCIÓN DE ESTÁNDARES TECNOLÓGICOS (DEUDA TÉCNICA):');
  for (const [est, cant] of Object.entries(m.distribucion_estandares)) {
    const pct = ((cant / m.total_aristas) * 100).toFixed(1);
    const barra = '█'.repeat(Math.round(cant * 2)).padEnd(20, '░');
    console.log(`   • ${est.padEnd(30, ' ')} : ${String(cant).padStart(2, ' ')} (${pct.padStart(5, ' ')}%)  ${barra}`);
  }
  console.log('');

  console.log('🔒 DISTRIBUCIÓN POR NIVEL DE APERTURA:');
  for (const [ap, cant] of Object.entries(m.distribucion_apertura)) {
    const pct = ((cant / m.total_aristas) * 100).toFixed(1);
    console.log(`   • ${ap.padEnd(30, ' ')} : ${String(cant).padStart(2, ' ')} (${pct.padStart(5, ' ')}%)`);
  }
  console.log('');

  console.log('🏢 DISTRIBUCIÓN POR TIPOLOGÍA INSTITUCIONAL:');
  for (const [tip, cant] of Object.entries(m.distribucion_tipologias)) {
    console.log(`   • ${tip.padEnd(25, ' ')} : ${cant} nodos`);
  }
  console.log('\n================================================================================');
  console.log('✨ VERIFICACIÓN EXITOSA: Código de salida 0');
  console.log('================================================================================\n');
}

// Punto de entrada CLI si se ejecuta directamente
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('validate-data.ts') ||
  process.argv[1].endsWith('validate-data.js')
);

if (isDirectExecution) {
  try {
    const dataPath = resolve(__dirname, '../src/data/interoperabilidad.json');
    const rawContent = readFileSync(dataPath, 'utf-8');
    const dataset = JSON.parse(rawContent) as DatasetInteroperabilidad;

    const resultado = validarDatasetInteroperabilidad(dataset);
    imprimirReporte(resultado);

    if (resultado.valido) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error catastrófico al cargar o validar dataset:', err);
    process.exit(1);
  }
}
