import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DatasetInteroperabilidad, NodoInstitucion, AristaInteroperabilidad } from '../src/types/interoperabilidad.js';

const datasetPath = resolve(process.cwd(), 'src/data/interoperabilidad.json');
const raw = JSON.parse(readFileSync(datasetPath, 'utf-8')) as DatasetInteroperabilidad;

// 1. New institutions from the 26-organism prototype
const newNodes: NodoInstitucion[] = [
  {
    id: "mineduc",
    nombre: "Ministerio de Educación",
    sigla: "MINEDUC",
    tipo: "ministerio",
    dependencia: "Ministerio de Educación",
    rol_ecosistema: "Custodio curricular y de acreditación académica: licencias de enseñanza media, títulos universitarios y matrícula escolar (SAE).",
    sitio_web: "https://www.mineduc.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "pjud",
    nombre: "Poder Judicial de Chile",
    sigla: "Poder Judicial",
    tipo: "organo_autonomo",
    dependencia: "Poder Judicial de la República",
    rol_ecosistema: "Resoluciones judiciales, causas y administración del Registro Nacional de Deudores de Pensiones de Alimentos.",
    sitio_web: "https://www.pjud.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "cmf",
    nombre: "Comisión para el Mercado Financiero",
    sigla: "CMF",
    tipo: "servicio_publico",
    dependencia: "Ministerio de Hacienda",
    rol_ecosistema: "Supervisión del mercado de valores, banca y seguros; provisión de estados de deuda financiera y cumplimiento FATCA/CRS.",
    sitio_web: "https://www.cmfchile.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  },
  {
    id: "minsal",
    nombre: "Ministerio de Salud",
    sigla: "MINSAL",
    tipo: "ministerio",
    dependencia: "Ministerio de Salud",
    rol_ecosistema: "Rectoría sanitaria nacional, Registro Nacional de Inmunizaciones (RNI), vigilancia epidemiológica y gestión de garantías GES.",
    sitio_web: "https://www.minsal.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "cenabast",
    nombre: "Central de Abastecimiento del Sistema Nacional de Servicios de Salud",
    sigla: "CENABAST",
    tipo: "servicio_publico",
    dependencia: "Ministerio de Salud",
    rol_ecosistema: "Gestión consolidada de compras y distribución logística de fármacos e insumos clínicos para la red hospitalaria pública.",
    sitio_web: "https://www.cenabast.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "sermig",
    nombre: "Servicio Nacional de Migraciones",
    sigla: "SERMIG",
    tipo: "servicio_publico",
    dependencia: "Ministerio del Interior y Seguridad Pública",
    rol_ecosistema: "Gestión de visas de residencia, trámites de nacionalización, permanencia definitiva y regularización de extranjeros.",
    sitio_web: "https://serviciomigraciones.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "pdi",
    nombre: "Policía de Investigaciones de Chile",
    sigla: "PDI",
    tipo: "servicio_publico",
    dependencia: "Ministerio del Interior y Seguridad Pública",
    rol_ecosistema: "Control migratorio fronterizo, registros policiales de antecedentes e investigación criminalística especializada.",
    sitio_web: "https://www.pdichile.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  },
  {
    id: "carabineros",
    nombre: "Carabineros de Chile",
    sigla: "Carabineros",
    tipo: "servicio_publico",
    dependencia: "Ministerio del Interior y Seguridad Pública",
    rol_ecosistema: "Seguridad pública, control de tránsito, órdenes judiciales y Comisaría Virtual de trámites ciudadanos.",
    sitio_web: "https://www.carabineros.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  },
  {
    id: "dt",
    nombre: "Dirección del Trabajo",
    sigla: "Dirección del Trabajo",
    tipo: "servicio_publico",
    dependencia: "Ministerio del Trabajo y Previsión Social",
    rol_ecosistema: "Registro electrónico laboral de contratos, finiquitos, libro de remuneraciones electrónico y fiscalización sindical.",
    sitio_web: "https://www.dt.gob.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  },
  {
    id: "sence",
    nombre: "Servicio Nacional de Capacitación y Empleo",
    sigla: "SENCE",
    tipo: "servicio_publico",
    dependencia: "Ministerio del Trabajo y Previsión Social",
    rol_ecosistema: "Administración de subsidios al empleo, franquicias tributarias de capacitación y certificación de competencias laborales.",
    sitio_web: "https://sence.gob.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "mtt",
    nombre: "Ministerio de Transportes y Telecomunicaciones",
    sigla: "MTT",
    tipo: "ministerio",
    dependencia: "Ministerio de Transportes y Telecomunicaciones",
    rol_ecosistema: "Registro de vehículos motorizados, licencias de conducir, transporte público regulado y fiscalización vial.",
    sitio_web: "https://www.mtt.gob.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "sernac",
    nombre: "Servicio Nacional del Consumidor",
    sigla: "SERNAC",
    tipo: "servicio_publico",
    dependencia: "Ministerio de Economía, Fomento y Turismo",
    rol_ecosistema: "Defensa de los derechos del consumidor, portal del informante y tramitación de reclamos masivos contra proveedores.",
    sitio_web: "https://www.sernac.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  },
  {
    id: "ine",
    nombre: "Instituto Nacional de Estadísticas",
    sigla: "INE",
    tipo: "servicio_publico",
    dependencia: "Ministerio de Economía, Fomento y Turismo",
    rol_ecosistema: "Producción estadística oficial demográfica, censos, IPC y proyecciones poblacionales comunales para fondos fiscales.",
    sitio_web: "https://www.ine.gob.cl",
    nivel_madurez_digital: "medio",
    estado_adopcion_ley21180: "fase_2_procedimientos"
  },
  {
    id: "sna",
    nombre: "Servicio Nacional de Aduanas",
    sigla: "Aduanas",
    tipo: "servicio_publico",
    dependencia: "Ministerio de Hacienda",
    rol_ecosistema: "Fiscalización del comercio exterior, declaraciones de ingreso (DIN), aranceles y control de pasos aduaneros.",
    sitio_web: "https://www.aduana.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  },
  {
    id: "ips",
    nombre: "Instituto de Previsión Social",
    sigla: "IPS / ChileAtiende",
    tipo: "servicio_publico",
    dependencia: "Ministerio del Trabajo y Previsión Social",
    rol_ecosistema: "Administración de pensiones solidarias (PGU), subsidios estatales y red de atención multicanal del Estado ChileAtiende.",
    sitio_web: "https://www.ips.gob.cl",
    nivel_madurez_digital: "alto",
    estado_adopcion_ley21180: "fase_3_interoperabilidad"
  }
];

// Add new nodes avoiding duplicates
const existingNodeIds = new Set(raw.nodos.map(n => n.id));
for (const n of newNodes) {
  if (!existingNodeIds.has(n.id)) {
    raw.nodos.push(n);
    existingNodeIds.add(n.id);
  }
}

// 2. Classify existing edges with channel & maturity
for (const edge of raw.aristas) {
  if (!edge.canal) {
    if (edge.plataforma_o_bus.includes('PISEE') || edge.plataforma_o_bus.includes('ClaveÚnica') || edge.plataforma_o_bus.includes('DocDigital')) {
      edge.canal = 'PISEE';
    } else if (edge.plataforma_o_bus.includes('Manual') || edge.estandar_o_protocolo === 'Bilateral Propietario') {
      edge.canal = 'Manual';
    } else {
      edge.canal = 'Convenio';
    }
  }

  if (!edge.madurez_tecnica) {
    if (edge.estandar_o_protocolo === 'REST / JSON' || edge.estandar_o_protocolo === 'OpenID Connect / OAuth2' || edge.estandar_o_protocolo === 'Webhooks / Event-driven') {
      edge.madurez_tecnica = 'realtime';
    } else if (edge.estandar_o_protocolo === 'SFTP / Batch plano o CSV') {
      edge.madurez_tecnica = 'batch';
    } else if (edge.frecuencia_actualizacion === 'A demanda / manual') {
      edge.madurez_tecnica = 'manual';
    } else {
      edge.madurez_tecnica = 'realtime';
    }
  }
}

// 3. New prototype edges
const newEdges: AristaInteroperabilidad[] = [
  {
    id: "mineduc-pisee-licencias",
    origen: "mineduc",
    destino: "pisee",
    plataforma_o_bus: "PISEE (SGD)",
    tipo_dato: "Certificado Licencia Enseñanza Media y Títulos",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Público",
    fuente_oficial_url: "https://pisee.gob.cl",
    brecha_observada: "Falta de estandarización en certificados históricos anteriores al año 2000 que requieren validación manual en oficina regional.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Ley N° 21.180 sobre Transformación Digital",
    canal: "PISEE",
    madurez_tecnica: "realtime"
  },
  {
    id: "pisee-sence-escolaridad",
    origen: "pisee",
    destino: "sence",
    plataforma_o_bus: "PISEE (SGD)",
    tipo_dato: "Acreditación de Escolaridad para Becas Laborales",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://pisee.gob.cl",
    brecha_observada: "Tiempos de respuesta variables en horas pico de postulaciones masivas a becas SENCE con timeouts ocasionales.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Ley N° 19.518 y Ley N° 21.180",
    canal: "PISEE",
    madurez_tecnica: "realtime"
  },
  {
    id: "pjud-pisee-pensiones",
    origen: "pjud",
    destino: "pisee",
    plataforma_o_bus: "PISEE (SGD)",
    tipo_dato: "Registro Nacional de Deudores de Pensiones de Alimentos",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.pjud.cl",
    brecha_observada: "Desfase horario en el cómputo de liquidaciones judiciales nocturnas respecto al bus central de interoperabilidad.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Ley N° 21.389",
    canal: "PISEE",
    madurez_tecnica: "realtime"
  },
  {
    id: "dt-pisee-contratos",
    origen: "dt",
    destino: "pisee",
    plataforma_o_bus: "PISEE (SGD)",
    tipo_dato: "Finiquitos y Contratos Laborales Vigentes",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.dt.gob.cl",
    brecha_observada: "Omisión patronal frecuente en el ingreso oportuno de términos de relación laboral genera discrepancias en subsidios.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Código del Trabajo y Ley N° 21.180",
    canal: "PISEE",
    madurez_tecnica: "realtime"
  },
  {
    id: "pisee-ips-subsidios",
    origen: "pisee",
    destino: "ips",
    plataforma_o_bus: "PISEE (SGD)",
    tipo_dato: "Subsidios por Incapacidad Laboral y Verificación de Supervivencia",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://pisee.gob.cl",
    brecha_observada: "Doble validación requerida con el Registro Civil que ralentiza la liquidación mensual de pagos previsionales.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Ley N° 20.255 y Ley N° 21.419",
    canal: "PISEE",
    madurez_tecnica: "realtime"
  },
  {
    id: "srcei-pdi-pasaportes",
    origen: "srcei",
    destino: "pdi",
    plataforma_o_bus: "Convenio Bilateral SRCEI-PDI",
    tipo_dato: "Ficha Dactilar y Pasaportes Electrónicos",
    estandar_o_protocolo: "SOAP / XML (WSDL)",
    nivel_apertura: "Reservado",
    fuente_oficial_url: "https://www.registrocivil.cl",
    brecha_observada: "Uso de protocolo SOAP legacy con certificados mTLS punto a punto sin integración al catálogo transversal PISEE.",
    frecuencia_actualizacion: "Near-real-time",
    base_legal: "Convenio Interinstitucional PDI-SRCEI",
    canal: "Convenio",
    madurez_tecnica: "realtime"
  },
  {
    id: "pdi-sermig-movimientos",
    origen: "pdi",
    destino: "sermig",
    plataforma_o_bus: "SFTP Seguro PDI-SERMIG",
    tipo_dato: "Movimientos Migratorios de Extranjeros en Pasos Fronterizos",
    estandar_o_protocolo: "SFTP / Batch plano o CSV",
    nivel_apertura: "Reservado",
    fuente_oficial_url: "https://serviciomigraciones.cl",
    brecha_observada: "Procesamiento por lotes diario nocturno impide la actualización en tiempo real del estatus de permanencia.",
    frecuencia_actualizacion: "Batch diario",
    base_legal: "Ley N° 21.325 de Migración y Extranjería",
    canal: "Convenio",
    madurez_tecnica: "batch"
  },
  {
    id: "minsal-fonasa-ges",
    origen: "minsal",
    destino: "fonasa",
    plataforma_o_bus: "API Dedicada MINSAL-FONASA",
    tipo_dato: "Garantías GES Notificadas y Cumplimiento de Plazos",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.minsal.cl",
    brecha_observada: "Falta de interoperabilidad con sistemas hospitalarios privados en convenios GES que genera demoras en el reporte.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Ley N° 19.966 del Régimen de Garantías en Salud",
    canal: "Convenio",
    madurez_tecnica: "realtime"
  },
  {
    id: "cenabast-minsal-farmacos",
    origen: "cenabast",
    destino: "minsal",
    plataforma_o_bus: "SFTP CENABAST-MINSAL",
    tipo_dato: "Stock de Fármacos Críticos Hospitalarios",
    estandar_o_protocolo: "SFTP / Batch plano o CSV",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.cenabast.cl",
    brecha_observada: "Desfase de hasta 24 horas entre inventarios físicos de farmacias hospitalarias y la base consolidada CENABAST.",
    frecuencia_actualizacion: "Batch diario",
    base_legal: "DFL N° 1/2005 Ministerio de Salud",
    canal: "Convenio",
    madurez_tecnica: "batch"
  },
  {
    id: "sna-sii-aduanas",
    origen: "sna",
    destino: "sii",
    plataforma_o_bus: "Web Service Aduanas-SII",
    tipo_dato: "Declaraciones de Ingreso Aduanero (DIN)",
    estandar_o_protocolo: "SOAP / XML (WSDL)",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.aduana.cl",
    brecha_observada: "Formatos XML heterogéneos según tipo de carga que exigen procesos pesados de transformación y homologación.",
    frecuencia_actualizacion: "Batch diario",
    base_legal: "Ordenanza de Aduanas y Código Tributario",
    canal: "Convenio",
    madurez_tecnica: "batch"
  },
  {
    id: "cmf-sii-fatca",
    origen: "cmf",
    destino: "sii",
    plataforma_o_bus: "Convenio de Información Financiera",
    tipo_dato: "Información de Cuentas Financieras (FATCA/CRS)",
    estandar_o_protocolo: "SFTP / Batch plano o CSV",
    nivel_apertura: "Reservado",
    fuente_oficial_url: "https://www.cmfchile.cl",
    brecha_observada: "Envío anualizado en lotes comprimidos que impide el monitoreo tributario preventivo en el ejercicio fiscal.",
    frecuencia_actualizacion: "Batch mensual",
    base_legal: "Ley N° 20.780 y Acuerdos OCDE",
    canal: "Convenio",
    madurez_tecnica: "batch"
  },
  {
    id: "mtt-municipalidades-multas",
    origen: "mtt",
    destino: "municipalidades",
    plataforma_o_bus: "Registro de Multas No Pagadas",
    tipo_dato: "Registro de Multas de Tránsito No Pagadas",
    estandar_o_protocolo: "SFTP / Batch plano o CSV",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.mtt.gob.cl",
    brecha_observada: "Actualización semanal por SFTP provoca cobros indebidos de multas ya saldadas en otros municipios.",
    frecuencia_actualizacion: "Batch diario",
    base_legal: "Ley N° 18.290 de Tránsito",
    canal: "Convenio",
    madurez_tecnica: "batch"
  },
  {
    id: "carabineros-mtt-encargos",
    origen: "carabineros",
    destino: "mtt",
    plataforma_o_bus: "API Segura Carabineros-MTT",
    tipo_dato: "Encargo Policial por Robo de Vehículos",
    estandar_o_protocolo: "REST / JSON",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.carabineros.cl",
    brecha_observada: "Integración no universal en plantas de revisión técnica rurales que operan sin enlace de datos constante.",
    frecuencia_actualizacion: "Tiempo real / sincrónico",
    base_legal: "Ley Orgánica Constitucional de Carabineros N° 18.961",
    canal: "Convenio",
    madurez_tecnica: "realtime"
  },
  {
    id: "municipalidades-mdsf-informes",
    origen: "municipalidades",
    destino: "mdsf",
    plataforma_o_bus: "Oficio Electrónico / Trámite Manual",
    tipo_dato: "Informes Sociales Manuales de Caso para Excepciones RSH",
    estandar_o_protocolo: "Bilateral Propietario",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.registrosocial.gob.cl",
    brecha_observada: "Revisión documental en PDF con demoras administrativas de hasta 45 días hábiles en casos de urgencia social.",
    frecuencia_actualizacion: "A demanda / manual",
    base_legal: "Ley N° 20.379 y Decreto Supremo N° 22 MDSF",
    canal: "Manual",
    madurez_tecnica: "manual"
  },
  {
    id: "sernac-cmf-reclamos",
    origen: "sernac",
    destino: "cmf",
    plataforma_o_bus: "Oficio Electrónico Interinstitucional",
    tipo_dato: "Reclamos Financieros Ciudadanos Derivados",
    estandar_o_protocolo: "Bilateral Propietario",
    nivel_apertura: "Público",
    fuente_oficial_url: "https://www.sernac.cl",
    brecha_observada: "Traspaso de expedientes vía oficio sin API unificada que obliga a duplicar el registro del ciudadano.",
    frecuencia_actualizacion: "A demanda / manual",
    base_legal: "Ley N° 19.496 sobre Protección del Consumidor",
    canal: "Manual",
    madurez_tecnica: "manual"
  },
  {
    id: "ine-subdere-proyecciones",
    origen: "ine",
    destino: "subdere",
    plataforma_o_bus: "Oficio y Planillas INE-SUBDERE",
    tipo_dato: "Proyecciones Demográficas Comunales para Fondo Común Municipal",
    estandar_o_protocolo: "Bilateral Propietario",
    nivel_apertura: "Público",
    fuente_oficial_url: "https://www.ine.gob.cl",
    brecha_observada: "Entrega de planillas con agregación anual que no captura la dinámica de migración interna estacional.",
    frecuencia_actualizacion: "A demanda / manual",
    base_legal: "Decreto Ley N° 3.063 sobre Rentas Municipales",
    canal: "Manual",
    madurez_tecnica: "manual"
  },
  {
    id: "ips-municipalidades-pensiones",
    origen: "ips",
    destino: "municipalidades",
    plataforma_o_bus: "Planilla Firmada / Pago Rural",
    tipo_dato: "Nómina de Cobro de Pensiones Rurales en Municipios Aislados",
    estandar_o_protocolo: "Bilateral Propietario",
    nivel_apertura: "Restringido interinstitucional",
    fuente_oficial_url: "https://www.ips.gob.cl",
    brecha_observada: "Distribución física de nóminas que genera riesgos operativos en zonas sin conectividad bancaria.",
    frecuencia_actualizacion: "A demanda / manual",
    base_legal: "Ley N° 20.255 de Reforma Previsional",
    canal: "Manual",
    madurez_tecnica: "manual"
  }
];

const existingEdgeIds = new Set(raw.aristas.map(e => e.id));
for (const edge of newEdges) {
  if (!existingEdgeIds.has(edge.id)) {
    raw.aristas.push(edge);
    existingEdgeIds.add(edge.id);
  }
}

raw.fecha_actualizacion = new Date().toISOString().split('T')[0];
raw.version = "1.1.0";
raw.descripcion = "Dataset canónico enriquecido sobre la interoperabilidad del Estado de Chile: 32 nodos institucionales, canales PISEE, convenios bilaterales y trámites manuales, niveles de madurez técnica (REST, SFTP, Oficio) bajo la Ley N° 21.180.";

writeFileSync(datasetPath, JSON.stringify(raw, null, 2), 'utf-8');
console.log(`Dataset enriquecido con éxito: ${raw.nodos.length} nodos y ${raw.aristas.length} aristas.`);
