import fs from 'node:fs';
import path from 'node:path';

const datasetPath = path.resolve('src/data/interoperabilidad.json');
const raw = fs.readFileSync(datasetPath, 'utf8');
const data = JSON.parse(raw);

// 1. Asignar Ejes Temáticos por defecto
data.nodos = data.nodos.map((n: any) => {
  let eje = 'identidad_ciudadana';
  if (['mineduc', 'deportes'].includes(n.id)) eje = 'educacion_becas';
  else if (['minsal', 'fonasa', 'suseso', 'supersalud', 'isp', 'compin', 'cenabast'].includes(n.id)) eje = 'salud_seguridad_social';
  else if (['mdsf', 'minvu', 'serviu', 'ips', 'spensiones', 'sence', 'fosis', 'senama', 'senadis', 'injuv', 'mejorninez'].includes(n.id)) eje = 'proteccion_social_vivienda';
  else if (['sii', 'tgr', 'dipres', 'hacienda', 'chilecompra', 'cmf', 'bcch', 'aduana', 'pasarela_tgr'].includes(n.id)) eje = 'finanzas_tributario';
  else if (['pjud', 'fiscalia', 'defensoria', 'carabineros', 'pdi', 'gendarmeria', 'sermig', 'minjusticia', 'cbr', 'anci'].includes(n.id)) eje = 'justicia_seguridad';
  else if (['mma', 'sma', 'dga', 'mop', 'mtt', 'subdere', 'municipalidades', 'gores', 'sinim', 'bienes_nacionales', 'minagri', 'sag', 'conaf', 'sernageomin', 'sec', 'subpesca'].includes(n.id)) eje = 'territorio_medioambiente';
  
  return { ...n, eje_tematico: n.eje_tematico || eje };
});

// 2. Incorporar Nodos del Ecosistema Educativo y Silos Estatales
const nuevosNodos = [
  {
    id: 'junaeb',
    nombre: 'Junta Nacional de Auxilio Escolar y Becas',
    sigla: 'JUNAEB',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio de Educación',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Asignador de becas estudiantiles, alimentación escolar (PAE) y pase escolar TNE.',
    sitio_web: 'https://www.junaeb.cl',
    nivel_madurez_digital: 'medio',
    estado_adopcion_ley21180: 'fase_2_procedimientos',
    indice_madurez_interoperabilidad: 52,
    nivel_madurez_interoperabilidad: 3,
    procesos_clave: ['Pase Escolar TNE', 'Beca de Alimentación BAES', 'Becas de Mantención Indígena y Presidente'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 15.720 Crea la Junta Nacional de Auxilio Escolar y Becas',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=28511',
        ano: 1964,
        resumen: 'Marco legal orgánico que faculta a JUNAEB a administrar becas, residencias y servicios asistenciales a estudiantes.'
      }
    ]
  },
  {
    id: 'subesup',
    nombre: 'Subsecretaría de Educación Superior',
    sigla: 'SubESup',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio de Educación',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Administrador del Formulario Único de Acreditación Socioeconómica (FUAS), asignación de Gratuidad y aranceles regulados.',
    sitio_web: 'https://educacionsuperior.mineduc.cl',
    nivel_madurez_digital: 'medio',
    estado_adopcion_ley21180: 'fase_2_procedimientos',
    indice_madurez_interoperabilidad: 55,
    nivel_madurez_interoperabilidad: 3,
    procesos_clave: ['Postulación y Asignación de Gratuidad Universitaria (FUAS)', 'Becas de Arancel', 'Fondo Solidario de Crédito Universitario'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 21.091 sobre Educación Superior',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=1118958',
        ano: 2018,
        resumen: 'Crea la Subsecretaría de Educación Superior y fija el sistema de financiamiento institucional y gratuidad.'
      }
    ]
  },
  {
    id: 'ingresa',
    nombre: 'Comisión Administradora del Sistema de Créditos para Estudios Superiores (Ingresa)',
    sigla: 'Ingresa',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio de Educación',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Administrador del Crédito con Aval del Estado (CAE), cobranza contingente y nóminas de egresados deudores.',
    sitio_web: 'https://www.ingresa.cl',
    nivel_madurez_digital: 'medio',
    estado_adopcion_ley21180: 'fase_2_procedimientos',
    indice_madurez_interoperabilidad: 48,
    nivel_madurez_interoperabilidad: 3,
    procesos_clave: ['Asignación y Renovación Crédito CAE', 'Pago contingente al ingreso (10% arancel)', 'Cruce de deudores con TGR'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 20.027 Establece normas para el financiamiento de estudios de educación superior',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=239276',
        ano: 2005,
        resumen: 'Regula el Crédito con Aval del Estado y las facultades de la Comisión Ingresa.'
      }
    ]
  },
  {
    id: 'demre',
    nombre: 'Departamento de Evaluación, Medición y Registro Educacional (DEMRE - U. de Chile)',
    sigla: 'DEMRE',
    tipo: 'organo_autonomo',
    dependencia: 'Universidad de Chile / Consejo de Rectores CRUCH',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Administración, rendición y publicación de puntajes de la Prueba de Acceso a la Educación Superior (PAES).',
    sitio_web: 'https://demre.cl',
    nivel_madurez_digital: 'alto',
    estado_adopcion_ley21180: 'fase_2_procedimientos',
    indice_madurez_interoperabilidad: 64,
    nivel_madurez_interoperabilidad: 4,
    procesos_clave: ['Inscripción y Rendición PAES', 'Cálculo de NEM y Ranking de Notas', 'Postulación Centralizada a Universidades'],
    documentacion_oficial: [
      {
        titulo: 'Convenio Marco CRUCH - MINEDUC Sistema de Acceso a la Educación Superior',
        tipo: 'convenio',
        url: 'https://acceso.mineduc.cl/normativa',
        ano: 2020,
        resumen: 'Fija los protocolos de transferencia de puntajes de pruebas de admisión y notas de enseñanza media.'
      }
    ]
  },
  {
    id: 'supereduc',
    nombre: 'Superintendencia de Educación',
    sigla: 'SuperEduc',
    tipo: 'superintendencia',
    dependencia: 'Ministerio de Educación',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Fiscalización del uso de recursos públicos escolares, subvenciones y resguardo de derechos de la comunidad educativa.',
    sitio_web: 'https://www.supereduc.cl',
    nivel_madurez_digital: 'medio',
    estado_adopcion_ley21180: 'fase_2_procedimientos',
    indice_madurez_interoperabilidad: 58,
    nivel_madurez_interoperabilidad: 3,
    procesos_clave: ['Fiscalización de Subvención Escolar Preferencial (SEP)', 'Denuncias de vulneración de derechos en colegios', 'Rendición de cuentas sostenedores'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 20.529 Sistema Nacional de Aseguramiento de la Calidad de la Educación',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=1028635',
        ano: 2011,
        resumen: 'Crea la Superintendencia de Educación y fija sus facultades fiscalizadoras.'
      }
    ]
  },
  {
    id: 'junji',
    nombre: 'Junta Nacional de Jardines Infantiles',
    sigla: 'JUNJI',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio de Educación',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Gestión y provisión de salas cuna y jardines infantiles públicos en primera infancia.',
    sitio_web: 'https://www.junji.gob.cl',
    nivel_madurez_digital: 'medio',
    estado_adopcion_ley21180: 'fase_2_procedimientos',
    indice_madurez_interoperabilidad: 45,
    nivel_madurez_interoperabilidad: 3,
    procesos_clave: ['Postulación y Matrícula en Salas Cuna Públicas', 'Acreditación socioeconómica para cupos prioritarios'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 17.301 Crea la Junta Nacional de Jardines Infantiles',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=28990',
        ano: 1970,
        resumen: 'Regula las atribuciones de la JUNJI en educación parvularia.'
      }
    ]
  },
  // Nodos Silos (Desconectados del ecosistema digital - Nivel 1)
  {
    id: 'slep_red',
    nombre: 'Red Nacional de Servicios Locales de Educación Pública (SLEP)',
    sigla: 'Red SLEP',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio de Educación / Dirección de Educación Pública',
    eje_tematico: 'educacion_becas',
    rol_ecosistema: 'Administración descentralizada de establecimientos educacionales públicos traspasados desde municipios.',
    sitio_web: 'https://educacionpublica.gob.cl',
    es_silo: true,
    nivel_madurez_digital: 'bajo',
    estado_adopcion_ley21180: 'rezagado',
    indice_madurez_interoperabilidad: 18,
    nivel_madurez_interoperabilidad: 1,
    procesos_clave: ['Pago de remuneraciones docentes', 'Gestión de matrículas y asistencia escolar', 'Mantenimiento de infraestructura colegios'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 21.040 Crea el Sistema de Educación Pública',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=1111237',
        ano: 2017,
        resumen: 'Dispone la desmunicipalización y creación progresiva de los Servicios Locales de Educación.'
      }
    ]
  },
  {
    id: 'dgmn',
    nombre: 'Dirección General de Movilización Nacional',
    sigla: 'DGMN',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio de Defensa Nacional',
    eje_tematico: 'justicia_seguridad',
    rol_ecosistema: 'Custodio del Registro Militar obligatorio, control de armas, explosivos y artes marciales.',
    sitio_web: 'https://www.dgmn.cl',
    es_silo: true,
    nivel_madurez_digital: 'bajo',
    estado_adopcion_ley21180: 'rezagado',
    indice_madurez_interoperabilidad: 15,
    nivel_madurez_interoperabilidad: 1,
    procesos_clave: ['Sorteo del Servicio Militar Obligatorio', 'Acreditación de exclusión militar estudiantil o médica', 'Inscripción de armas de fuego'],
    documentacion_oficial: [
      {
        titulo: 'Decreto Ley N° 2.306 Dicta normas sobre Reclutamiento y Movilización de las FF.AA.',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=6955',
        ano: 1978,
        resumen: 'Regula las obligaciones militares y la potestad registral de la DGMN.'
      }
    ]
  }
];

nuevosNodos.forEach((nn) => {
  const idx = data.nodos.findIndex((n: any) => n.id === nn.id);
  if (idx >= 0) {
    data.nodos[idx] = nn;
  } else {
    data.nodos.push(nn);
  }
});

// 3. Incorporar Nuevas Aristas con Procesos Vitales
const nuevasAristas = [
  {
    id: 'mineduc-subesup-matricula-nem',
    origen: 'mineduc',
    destino: 'subesup',
    plataforma_o_bus: 'Bus Central MINEDUC (SIGE)',
    tipo_dato: 'Concentración de Notas de Enseñanza Media (NEM) y Matrícula Activa',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Postulación y asignación de Gratuidad Universitaria y Becas de Arancel (FUAS)',
    proceso_bloqueado_en_silo: 'El estudiante debe peregrinar a su colegio por un certificado físico de notas para apelar a la gratuidad',
    estandar_o_protocolo: 'REST / JSON',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://educacionsuperior.mineduc.cl/fuas-normativa',
    brecha_observada: 'La sincronización de egresados de cuarto medio se ejecuta en lotes batch periódicos, retrasando resultados del FUAS.',
    severity: 'moderada',
    normative_ref: 'Art. 8 DS N° 12/2023',
    frecuencia_actualizacion: 'Batch diario',
    canal: 'Convenio',
    madurez_tecnica: 'batch',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios'],
    base_licitud: 'obligacion_legal'
  },
  {
    id: 'mdsf-subesup-rsh-fuas',
    origen: 'mdsf',
    destino: 'subesup',
    plataforma_o_bus: 'Web Services RSH / Convenio MDSF',
    tipo_dato: 'Calificación Socioeconómica (RSH) del Grupo Familiar Postulante',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Determinación del 60% de menores ingresos para acceso a Gratuidad Universitaria',
    proceso_bloqueado_en_silo: 'Si la cartola RSH no coincide, el alumno queda sin gratuidad y debe acreditar ingresos con boletas en papel ante la asistente social universitaria',
    estandar_o_protocolo: 'SFTP / Batch plano o CSV',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://beneficiosestudiantiles.cl/requisitos-gratuidad',
    brecha_observada: 'El cruce con el Registro Social de Hogares se realiza mediante cargas masivas diferidas por lotes en vez de consulta síncrona en tiempo real.',
    severity: 'critica',
    normative_ref: 'Art. 8 y 13 DS N° 12/2023',
    frecuencia_actualizacion: 'Batch mensual',
    canal: 'Convenio',
    madurez_tecnica: 'batch',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios', 'economicos_tributarios'],
    base_licitud: 'mision_interes_publico',
    requiere_eipd: true
  },
  {
    id: 'demre-subesup-paes-puntajes',
    origen: 'demre',
    destino: 'subesup',
    plataforma_o_bus: 'API Acceso Mineduc / Convenio UChile',
    tipo_dato: 'Puntajes Oficiales PAES (Comprensión Lectora, Matemáticas, Ciencias e Historia)',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Selección centralizada y adjudicación de cupos y becas de excelencia académica',
    proceso_bloqueado_en_silo: 'El postulante debe digitar manualmente sus puntajes o esperar días para ver su estatus de beca',
    estandar_o_protocolo: 'REST / JSON',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://acceso.mineduc.cl',
    brecha_observada: 'Operación semi-síncrona con periodos de alta concurrencia que degradan la disponibilidad en días de publicación.',
    severity: 'moderada',
    normative_ref: 'Art. 4 DS N° 12/2023',
    frecuencia_actualizacion: 'Tiempo real / sincrónico',
    canal: 'Convenio',
    madurez_tecnica: 'realtime',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios']
  },
  {
    id: 'mineduc-junaeb-matricula-tne',
    origen: 'mineduc',
    destino: 'junaeb',
    plataforma_o_bus: 'SIGE / Convenio Mineduc-Junaeb',
    tipo_dato: 'Nómina Oficial de Alumnos Matriculados Regulares en Educación Básica, Media y Superior',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Activación del Pase Escolar TNE (tarifa rebajada en transporte público) y Beca BAES',
    proceso_bloqueado_en_silo: 'El estudiante pierde el beneficio tarifario y debe pagar tarifa adulta en Metro y Micro hasta que el colegio cargue la planilla',
    estandar_o_protocolo: 'SFTP / Batch plano o CSV',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://www.tne.cl',
    brecha_observada: 'Dependencia crítica de planillas manuales y desfase quincenal en la carga de matrículas universitarias y de colegios.',
    severity: 'critica',
    normative_ref: 'Art. 8 DS N° 12/2023',
    frecuencia_actualizacion: 'Batch mensual',
    canal: 'Convenio',
    madurez_tecnica: 'batch',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios']
  },
  {
    id: 'ingresa-tgr-retencion-cae',
    origen: 'ingresa',
    destino: 'tgr',
    plataforma_o_bus: 'Convenio Interinstitucional Ingresa-TGR',
    tipo_dato: 'Nómina de Deudores Morosos del Crédito CAE con Mandato de Retención Tributaria',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Retención de la devolución anual de impuestos a la renta para amortización de deuda del CAE',
    proceso_bloqueado_en_silo: 'El deudor paga el crédito pero Tesorería le retiene la devolución por falta de actualización en línea entre bancos e Ingresa',
    estandar_o_protocolo: 'SFTP / Batch plano o CSV',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://www.ingresa.cl/devolucion-impuestos',
    brecha_observada: 'Intercambio batch diferido anual que genera desfases en saldos pagados y retenciones indebidas a contribuyentes.',
    severity: 'critica',
    normative_ref: 'Art. 8 DS N° 12/2023',
    frecuencia_actualizacion: 'Batch mensual',
    canal: 'Convenio',
    madurez_tecnica: 'batch',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios', 'economicos_tributarios']
  },
  {
    id: 'srcei-junji-nacimientos-matricula',
    origen: 'srcei',
    destino: 'junji',
    plataforma_o_bus: 'Convenio de Interoperabilidad Civil-Parvularia',
    tipo_dato: 'Validación de Certificados de Nacimiento y Filiación Materna/Paterna',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Postulación y matrícula de lactantes y párvulos en Salas Cuna Públicas',
    proceso_bloqueado_en_silo: 'La madre debe acudir presencialmente con el certificado de nacimiento impreso para inscribir a su hijo en la sala cuna',
    estandar_o_protocolo: 'REST / JSON',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://simonline.junji.gob.cl',
    brecha_observada: 'Consumo parcial disponible solo en ciertos jardines metropolitanos; en regiones se sigue exigiendo certificado en papel.',
    severity: 'moderada',
    normative_ref: 'Art. 2 Ley N° 21.180',
    frecuencia_actualizacion: 'Tiempo real / sincrónico',
    canal: 'Convenio',
    madurez_tecnica: 'realtime',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios']
  },
  {
    id: 'supereduc-mineduc-fiscalizacion-sep',
    origen: 'supereduc',
    destino: 'mineduc',
    plataforma_o_bus: 'Sistema de Información General de Estudiantes (SIGE)',
    tipo_dato: 'Sanciones, Inhabilitaciones y Cumplimiento de Rendición de Subvenciones Escolares',
    eje_tematico: 'educacion_becas',
    proceso_ciudadano: 'Pago oportuno de subvenciones a colegios y continuidad de clases sin paros por insolvencia sostenedora',
    proceso_bloqueado_en_silo: 'Colegios públicos quedan sin recursos para calefacción o alimentación por retención cautelar de subvención',
    estandar_o_protocolo: 'REST / JSON',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://www.supereduc.cl/portal-sostenedor',
    brecha_observada: 'Integración en proceso de homologación hacia PISEE 2.0 con eventos síncronos.',
    severity: 'optima',
    normative_ref: 'Art. 4 DS N° 12/2023',
    frecuencia_actualizacion: 'Tiempo real / sincrónico',
    canal: 'Convenio',
    madurez_tecnica: 'realtime'
  }
];

nuevasAristas.forEach((na) => {
  const idx = data.aristas.findIndex((a: any) => a.id === na.id);
  if (idx >= 0) {
    data.aristas[idx] = na;
  } else {
    data.aristas.push(na);
  }
});

// Enriquecer procesos ciudadanos en flujos ya existentes críticos
data.aristas.forEach((a: any) => {
  if (a.id.includes('licencias-medicas') || a.id.includes('compin') || a.id.includes('suseso')) {
    a.eje_tematico = 'salud_seguridad_social';
    a.proceso_ciudadano = a.proceso_ciudadano || 'Pago oportuno de subsidio por incapacidad laboral (Licencia Médica)';
    a.proceso_bloqueado_en_silo = a.proceso_bloqueado_en_silo || 'El trabajador queda meses sin sueldo si COMPIN y FONASA no sincronizan el peritaje';
  } else if (a.id.includes('alimentos') || a.id.includes('deudores')) {
    a.eje_tematico = 'justicia_seguridad';
    a.proceso_ciudadano = a.proceso_ciudadano || 'Retención judicial de devolución de impuestos por pensión alimenticia adeudada';
    a.proceso_bloqueado_en_silo = a.proceso_bloqueado_en_silo || 'El deudor recibe la devolución completa y los hijos quedan desprotegidos';
  } else if (a.id.includes('rsh') || a.id.includes('subsidio')) {
    a.eje_tematico = 'proteccion_social_vivienda';
    a.proceso_ciudadano = a.proceso_ciudadano || 'Postulación y asignación de Subsidio Habitacional DS49 y Subsidio al Empleo';
    a.proceso_bloqueado_en_silo = a.proceso_bloqueado_en_silo || 'La familia queda fuera de postulación al subsidio por discrepancia de datos';
  } else if (a.id.includes('claveunica') || a.id.includes('srcei')) {
    a.eje_tematico = 'identidad_ciudadana';
    a.proceso_ciudadano = a.proceso_ciudadano || 'Autenticación digital unificada y verificación de identidad ciudadana';
    a.proceso_bloqueado_en_silo = a.proceso_bloqueado_en_silo || 'El ciudadano debe acudir a hacer filas a oficinas del Registro Civil';
  } else if (a.id.includes('sii') || a.id.includes('tgr') || a.id.includes('chilecompra')) {
    a.eje_tematico = 'finanzas_tributario';
    a.proceso_ciudadano = a.proceso_ciudadano || 'Declaración de Renta e inicio de actividades para pymes';
    a.proceso_bloqueado_en_silo = a.proceso_bloqueado_en_silo || 'Las pymes quedan bloqueadas para facturar y vender al Estado';
  } else if (a.id.includes('mma') || a.id.includes('dga') || a.id.includes('sma')) {
    a.eje_tematico = 'territorio_medioambiente';
    a.proceso_ciudadano = a.proceso_ciudadano || 'Fiscalización ambiental comunitaria y derechos de aprovechamiento de agua';
    a.proceso_bloqueado_en_silo = a.proceso_bloqueado_en_silo || 'Comunidades locales no pueden denunciar contaminación en tiempo real';
  }
});

fs.writeFileSync(datasetPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Dataset actualizado con éxito!');
console.log('Total nodos:', data.nodos.length);
console.log('Total aristas:', data.aristas.length);
