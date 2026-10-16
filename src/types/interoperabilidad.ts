/**
 * Tipos formales de dominio para el Grafo de Interoperabilidad del Estado de Chile.
 * Basado en la Ley N° 21.180 sobre Transformación Digital del Estado, DFL 1/2020 Segpres,
 * arquitectura PISEE 2.0 y plataforma ClaveÚnica (Secretaría de Gobierno Digital).
 */

export type TipoNodo =
  | 'ministerio'
  | 'servicio_publico'
  | 'bus_transversal'
  | 'gobierno_local'
  | 'organo_autonomo'
  | 'superintendencia';

export type MadurezDigital = 'alto' | 'medio' | 'bajo';

export type EstadoLey21180 =
  | 'fase_1_comunicaciones'
  | 'fase_2_procedimientos'
  | 'fase_3_interoperabilidad'
  | 'rezagado';

export type TipoDocumentoOficial =
  | 'decreto'
  | 'resolucion'
  | 'convenio'
  | 'oficio'
  | 'guia_tecnica'
  | 'diccionario_datos'
  | 'ficha_tramite';

export interface DocumentoOficial {
  /** Título o nombre formal del documento */
  titulo: string;
  /** Tipología jurídica o técnica del documento */
  tipo: TipoDocumentoOficial;
  /** Enlace oficial verificable al documento */
  url: string;
  /** Año o fecha de emisión del documento */
  ano: number | string;
  /** Resumen ejecutivo del alcance regulatorio o técnico */
  resumen: string;
}

export type RangoMadurezIMI = 1 | 2 | 3 | 4 | 5;
export type NivelMadurezIMI = RangoMadurezIMI;

export interface CapacidadesAgenteIA {
  /** Soporte o compatibilidad con Model Context Protocol (MCP) */
  mcp_compatible: boolean;
  /** Especificación formal machine-readable estricta OpenAPI v3.1 / JSON Schema */
  openapi_spec: boolean;
  /** Arquitectura reactiva de eventos, webhooks o SSE */
  event_driven: boolean;
  /** Transaccionalidad segura con clave de idempotencia (Idempotency-Key) */
  idempotencia: boolean;
  /** Trazabilidad algorítmica y logs de auditoría para ejecuciones autónomas (Zero Human / Ley 21.180) */
  auditabilidad_algoritmica?: boolean;
}

export type SeveridadBrecha = 'critica' | 'moderada' | 'optima';

/**
 * Calificación de Ciberseguridad según Ley N° 21.663 (Marco de Ciberseguridad e Infraestructura Crítica)
 */
export type CalificacionCiberseguridad =
  | 'operador_importancia_vital'
  | 'prestador_servicios_esenciales'
  | 'organo_sector_publico'
  | 'estandar';

/**
 * Tipología de Despliegue de Nodos en la Red de Interoperabilidad (DS N° 12/2023 y PISEE 2.0)
 */
export type TipoDespliegueNodo =
  | 'nodo_centralizado'
  | 'nodo_perimetral_p2p'
  | 'nodo_hibrido'
  | 'gateway_api';

/**
 * Categorías de datos personales reguladas por Ley N° 21.719
 */
export type CategoriaDatosPersonales =
  | 'identificatorios'
  | 'economicos_tributarios'
  | 'salud_biometricos'
  | 'judiciales'
  | 'sensibles_especiales'
  | 'ninguno';

/**
 * Bases de licitud para tratamiento en órganos públicos (Arts. 13, 20 y 21 Ley N° 21.719)
 */
export type BaseLicitud =
  | 'obligacion_legal'
  | 'mision_interes_publico'
  | 'ejecucion_contrato'
  | 'consentimiento_expreso'
  | 'vital_salud';

/**
 * Indicadores institucionales de cumplimiento Ley N° 21.719
 */
export interface ComplianceLey21719Institucion {
  oficial_proteccion_datos: boolean;
  registro_actividades_tratamiento: boolean;
  politica_privacidad_actualizada: boolean;
  nivel_cumplimiento: 'alto' | 'medio' | 'en_adecuacion' | 'critico';
}

/**
 * Indicadores por flujo de interoperabilidad bajo Ley N° 21.719
 */
export interface ComplianceLey21719Flujo {
  base_licitud: BaseLicitud;
  requiere_eipd: boolean;
  involucra_datos_personales: boolean;
  categoria_datos_personales?: CategoriaDatosPersonales[];
}

export type EjeTematico =
  | 'identidad_ciudadana'
  | 'educacion_becas'
  | 'salud_seguridad_social'
  | 'vivienda_urbanismo'
  | 'trabajo_pensiones'
  | 'proteccion_social'
  | 'finanzas_tributario'
  | 'justicia_seguridad'
  | 'transporte_movilidad';

export interface NodoInstitucion {
  /** Slug unívoco identificador del nodo (ej. 'srcei', 'pisee', 'sii') */
  id: string;
  /** Nombre oficial completo de la institución */
  nombre: string;
  /** Sigla o nombre corto comúnmente utilizado */
  sigla: string;
  /** Tipología orgánica en el aparato estatal */
  tipo: TipoNodo;
  /** Ministerio o poder del Estado del cual depende orgánica o funcionalmente */
  dependencia: string;
  /** Eje temático principal de competencia o datos gestionados */
  eje_tematico?: EjeTematico;
  /** Descripción del rol que cumple dentro del ecosistema de interoperabilidad */
  rol_ecosistema: string;
  /** URL oficial institucional verificable */
  sitio_web: string;
  /** Indica si la institución es un silo sin conectores formales hacia la red */
  es_silo?: boolean;
  /** Trámites o procesos ciudadanos que gestiona o donde participa */
  procesos_clave?: string[];
  /** Estimación cualitativa de madurez digital técnica */
  nivel_madurez_digital: MadurezDigital;
  /** Fase actual de adopción de la Ley N° 21.180 según calendario oficial */
  estado_adopcion_ley21180: EstadoLey21180;
  /** Índice de Madurez de Interoperabilidad Normativo (0 a 100 puntos según DS N° 12/2023) */
  indice_madurez_interoperabilidad?: number;
  /** Nivel de Madurez de Interoperabilidad institucional (1 a 5) */
  nivel_madurez_interoperabilidad?: RangoMadurezIMI;
  /** Puntaje independiente de preparación para agentes de IA (0 a 4 checks) */
  ai_readiness_score?: number;
  /** Bandera indicadora de organismo pionero o certificado como Agent-Ready */
  agent_ready?: boolean;
  /** Capacidades técnicas avanzadas para interacción con agentes autónomos y LLMs */
  capacidades_agente?: CapacidadesAgenteIA;
  /** Expediente de documentación oficial y respaldo legal verificable */
  documentacion_oficial?: DocumentoOficial[];
  /** Calificación bajo Ley N° 21.663 de Ciberseguridad */
  calificacion_ciberseguridad?: CalificacionCiberseguridad;
  /** Modelo de despliegue de nodo en la red de interoperabilidad (PISEE 2.0) */
  tipo_despliegue_nodo?: TipoDespliegueNodo;
  /** Compliance con Ley N° 21.719 de Protección de Datos Personales */
  compliance_ley21719?: ComplianceLey21719Institucion;
}

export type EstandarProtocolo =
  | 'REST / JSON'
  | 'SOAP / XML (WSDL)'
  | 'OpenID Connect / OAuth2'
  | 'SFTP / Batch plano o CSV'
  | 'Webhooks / Event-driven'
  | 'Bilateral Propietario';

export type NivelApertura =
  | 'Público'
  | 'Restringido interinstitucional'
  | 'Reservado';

export type FrecuenciaActualizacion =
  | 'Tiempo real / sincrónico'
  | 'Near-real-time'
  | 'Batch diario'
  | 'Batch mensual'
  | 'A demanda / manual';

export type CanalInteroperabilidad = 'PISEE' | 'Convenio' | 'Manual';

export type MadurezFlujo = 'realtime' | 'batch' | 'manual';

export interface AristaInteroperabilidad {
  /** Slug identificador unívoco de la relación (ej. 'srcei-claveunica-autenticacion') */
  id: string;
  /** ID del nodo emisor/fuente del flujo de datos */
  origen: string;
  /** ID del nodo receptor/consumidor del flujo de datos */
  destino: string;
  /** Nombre del bus, gateway o enlace técnico utilizado */
  plataforma_o_bus: string;
  /** Naturaleza o tipo del dato intercambiado */
  tipo_dato: string;
  /** Eje temático del dato transferido */
  eje_tematico?: EjeTematico;
  /** Proceso o trámite de la vida de las personas al que sirve este flujo */
  proceso_ciudadano?: string;
  /** Trámite o proceso que se bloquea o degrada a papel si este flujo falla */
  proceso_bloqueado_en_silo?: string;
  /** Estándar técnico o protocolo de comunicación */
  estandar_o_protocolo: EstandarProtocolo;
  /** Clasificación de seguridad y acceso de los datos */
  nivel_apertura: NivelApertura;
  /** URL oficial que respalda la existencia y especificación técnica de la relación */
  fuente_oficial_url: string;
  /** Diagnóstico de brecha técnica, acoplamiento o fricción observada */
  brecha_observada: string;
  /** Clasificación de severidad de la brecha observada */
  severity?: SeveridadBrecha;
  /** Artículo vulnerado del DS N° 12/2023 MinSegpres */
  normative_ref?: string;
  /** Periodicidad o frecuencia del intercambio de datos */
  frecuencia_actualizacion: FrecuenciaActualizacion;
  /** Estimación cuantitativa o cualitativa del volumen transaccional */
  volumen_transaccional_estimado?: string;
  /** Mandato legal o reglamentario que fundamenta la interoperabilidad */
  base_legal?: string;
  /** Canal institucional de intercambio (PISEE oficial, Convenio bilateral, Manual/Oficio) */
  canal?: CanalInteroperabilidad;
  /** Nivel de madurez técnica del flujo (realtime, batch, manual) */
  madurez_tecnica?: MadurezFlujo;
  /** Indica si el flujo transfiere datos personales amparados por Ley N° 21.719 */
  involucra_datos_personales?: boolean;
  /** Tipología o categoría de datos personales transferidos */
  categoria_datos_personales?: CategoriaDatosPersonales[];
  /** Fundamento o base de licitud para el intercambio (Arts. 13, 20-21 Ley 21.719) */
  base_licitud?: BaseLicitud;
  /** Indica si el flujo amerita Evaluación de Impacto en Protección de Datos (EIPD) */
  requiere_eipd?: boolean;
  /** Compliance o estado de gobernanza del flujo respecto a Ley N° 21.719 */
  compliance_ley21719?: boolean | ComplianceLey21719Flujo;
}

export interface DatasetInteroperabilidad {
  version: string;
  fecha_actualizacion: string;
  descripcion: string;
  nodos: NodoInstitucion[];
  aristas: AristaInteroperabilidad[];
}

/** Alias para compatibilidad con nomenclaturas alternativas */
export type InteroperabilidadDataset = DatasetInteroperabilidad;

export interface CentralidadNodo {
  id: string;
  sigla: string;
  nombre: string;
  tipo: TipoNodo;
  grado_total: number;
  in_degree: number;
  out_degree: number;
}

export interface CuelloDeBotella {
  id: string;
  sigla: string;
  nombre: string;
  tipo: TipoNodo;
  grado_total: number;
  rol_critico: string;
  motivo: string;
  brechas_asociadas: string[];
}

export interface MetricasGrafo {
  total_nodos: number;
  total_aristas: number;
  /** Densidad del grafo dirigido: E / (V * (V - 1)) */
  densidad: number;
  /** Densidad no dirigida: 2E / (V * (V - 1)) */
  densidad_no_dirigida: number;
  /** Grado promedio por nodo: (sum of degrees) / V */
  grado_promedio: number;
  /** Ranking de centralidad ordenado por grado total (in + out) */
  ranking_centralidad: CentralidadNodo[];
  /** Nodos identificados como articuladores críticos / cuellos de botella */
  cuellos_de_botella: CuelloDeBotella[];
  /** Distribución cuantitativa de estándares tecnológicos */
  distribucion_estandares: Record<EstandarProtocolo, number>;
  /** Distribución de niveles de apertura */
  distribucion_apertura: Record<NivelApertura, number>;
  /** Distribución de tipologías institucionales */
  distribucion_tipologias: Record<TipoNodo, number>;
  /** Distribución de niveles de madurez digital */
  distribucion_madurez: Record<MadurezDigital, number>;
  /** Promedio del Nivel de Conexión Digital (0 a 100 puntos según DS 12) */
  promedio_imi?: number;
  /** Distribución de organismos por nivel de conexión digital (1 a 5) */
  distribucion_imi?: Record<RangoMadurezIMI, number>;
}

export interface ResultadoValidacion {
  valido: boolean;
  total_reglas_evaluadas: number;
  errores: string[];
  advertencias: string[];
  metricas?: MetricasGrafo;
}
