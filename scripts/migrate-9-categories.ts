import fs from 'node:fs';
import path from 'node:path';

const datasetPath = path.resolve('src/data/interoperabilidad.json');
const raw = fs.readFileSync(datasetPath, 'utf8');
const data = JSON.parse(raw);

// 1. Incorporar nuevos nodos para Trabajo/Pensiones y Transporte si no existen
const nodosExtra = [
  {
    id: 'dt',
    nombre: 'Dirección del Trabajo',
    sigla: 'DT',
    tipo: 'servicio_publico',
    dependencia: 'Ministerio del Trabajo y Previsión Social',
    eje_tematico: 'trabajo_pensiones',
    rol_ecosistema: 'Custodio del Registro Electrónico Laboral, contratos, finiquitos electrónicos y fiscalización laboral.',
    sitio_web: 'https://www.dt.gob.cl',
    nivel_madurez_digital: 'alto',
    estado_adopcion_ley21180: 'fase_3_interoperabilidad',
    indice_madurez_interoperabilidad: 78,
    nivel_madurez_interoperabilidad: 4,
    procesos_clave: ['Finiquito Laboral Electrónico', 'Libro de Remuneraciones Electrónico (LRE)', 'Mediaciones y fiscalización'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 21.327 sobre Modernización de la Dirección del Trabajo',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=1159346',
        ano: 2021,
        resumen: 'Crea el Registro Electrónico Laboral obligatorio y mandata la interoperabilidad con organismos previsionales y tributarios.'
      }
    ]
  },
  {
    id: 'mtt',
    nombre: 'Ministerio de Transportes y Telecomunicaciones',
    sigla: 'MTT',
    tipo: 'ministerio',
    dependencia: 'Ministerio de Transportes y Telecomunicaciones',
    eje_tematico: 'transporte_movilidad',
    rol_ecosistema: 'Rector de conectividad terrestre, subsidios al transporte público mayor y regulación del tránsito nacional.',
    sitio_web: 'https://www.mtt.gob.cl',
    nivel_madurez_digital: 'alto',
    estado_adopcion_ley21180: 'fase_3_interoperabilidad',
    indice_madurez_interoperabilidad: 74,
    nivel_madurez_interoperabilidad: 4,
    procesos_clave: ['Permisos de Circulación', 'Subsidio al Transporte Público Regional y Metropolitano', 'Registro Nacional de Servicios de Transporte de Pasajeros'],
    documentacion_oficial: [
      {
        titulo: 'Ley N° 18.290 de Tránsito',
        tipo: 'decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=29708',
        ano: 1984,
        resumen: 'Fija el régimen normativo de permisos de circulación, licencias de conducir y registro de vehículos.'
      }
    ]
  }
];

nodosExtra.forEach((ne) => {
  const idx = data.nodos.findIndex((n: any) => n.id === ne.id);
  if (idx >= 0) {
    data.nodos[idx] = { ...data.nodos[idx], ...ne };
  } else {
    data.nodos.push(ne);
  }
});

// 2. Mapear Ejes Temáticos de Nodos a las 9 Categorías
data.nodos = data.nodos.map((n: any) => {
  let eje = 'identidad_ciudadana';
  const id = n.id;

  // 1. Identidad
  if (['srcei', 'claveunica', 'sgd', 'docdigital', 'notificaciones'].includes(id)) {
    eje = 'identidad_ciudadana';
  }
  // 2. Educación
  else if (['mineduc', 'deportes', 'junaeb', 'subesup', 'ingresa', 'demre', 'supereduc', 'junji', 'slep_red', 'culturas', 'ciencia'].includes(id)) {
    eje = 'educacion_becas';
  }
  // 3. Salud
  else if (['minsal', 'fonasa', 'suseso', 'supersalud', 'isp', 'compin', 'cenabast'].includes(id)) {
    eje = 'salud_seguridad_social';
  }
  // 4. Vivienda y Urbanismo
  else if (['minvu', 'serviu', 'cbr'].includes(id)) {
    eje = 'vivienda_urbanismo';
  }
  // 5. Trabajo y Pensiones
  else if (['mintrabor', 'mintrab', 'ips', 'spensiones', 'dt', 'sence'].includes(id)) {
    eje = 'trabajo_pensiones';
  }
  // 6. Protección Social
  else if (['mdsf', 'fosis', 'senama', 'senadis', 'injuv', 'mejorninez', 'minmujer'].includes(id)) {
    eje = 'proteccion_social';
  }
  // 7. Impuestos y Finanzas
  else if (['sii', 'tgr', 'dipres', 'hacienda', 'chilecompra', 'cmf', 'bcch', 'aduana', 'pasarela_tgr', 'economia'].includes(id)) {
    eje = 'finanzas_tributario';
  }
  // 8. Justicia y Seguridad
  else if (['pjud', 'fiscalia', 'defensoria', 'carabineros', 'pdi', 'gendarmeria', 'sermig', 'minjusticia', 'apdp', 'anci', 'interior', 'defensa', 'dgmn'].includes(id)) {
    eje = 'justicia_seguridad';
  }
  // 9. Transporte y Movilidad / Territorio
  else if (['mtt', 'mop', 'mma', 'sma', 'dga', 'subdere', 'municipalidades', 'gores', 'sinim', 'bienes_nacionales', 'minagri', 'sag', 'conaf', 'sernageomin', 'sec', 'subpesca', 'energia', 'mineria', 'segegob', 'minrel', 'sociedad_civil', 'pisee', 'cgr', 'cplt', 'tdlc', 'tribunal_ambiental', 'sernac', 'ine'].includes(id)) {
    if (['mtt'].includes(id)) {
      eje = 'transporte_movilidad';
    } else if (['mma', 'sma', 'dga', 'mop', 'bienes_nacionales', 'sag', 'conaf', 'sernageomin', 'sec', 'subpesca', 'energia', 'mineria'].includes(id)) {
      eje = 'transporte_movilidad';
    } else {
      eje = 'transporte_movilidad';
    }
  }

  return { ...n, eje_tematico: eje };
});

// 3. Mapear Ejes Temáticos y Procesos en las Aristas
data.aristas.forEach((a: any) => {
  const orig = a.origen;
  const dest = a.destino;
  const id = a.id;

  // Vivienda
  if (['minvu', 'serviu', 'cbr'].includes(orig) || ['minvu', 'serviu', 'cbr'].includes(dest)) {
    a.eje_tematico = 'vivienda_urbanismo';
    if (id.includes('cbr') || id.includes('inmuebles') || id.includes('avaluos')) {
      a.proceso_ciudadano = 'Escrituración, transferencias de dominio de propiedades y avalúo fiscal';
      a.proceso_bloqueado_en_silo = 'El comprador debe pagar y esperar semanas por copias de dominio vigentes en el Conservador de Bienes Raíces';
    } else if (id.includes('subsidio') || id.includes('serviu')) {
      a.proceso_ciudadano = 'Postulación, selección y pago de subsidios habitacionales para familias (DS49 / DS1)';
      a.proceso_bloqueado_en_silo = 'Las familias quedan frenadas para recibir su subsidio por retrasos en la verificación de propiedad';
    } else if (id.includes('dom')) {
      a.proceso_ciudadano = 'Permisos de edificación y recepción final en Direcciones de Obras Municipales (DOM en Línea)';
      a.proceso_bloqueado_en_silo = 'Paralización de obras de vivienda social por oficios físicos entre municipios y SERVIU';
    }
  }
  // Trabajo y Pensiones
  else if (['mintrab', 'ips', 'spensiones', 'dt', 'sence'].includes(orig) || ['mintrab', 'ips', 'spensiones', 'dt', 'sence'].includes(dest)) {
    a.eje_tematico = 'trabajo_pensiones';
    if (id.includes('pensiones') || id.includes('pgu') || orig === 'spensiones' || dest === 'spensiones') {
      a.proceso_ciudadano = 'Concesión y pago mensual de la Pensión Garantizada Universal (PGU) y jubilaciones';
      a.proceso_bloqueado_en_silo = 'El adulto mayor debe acudir con liquidaciones en papel a ChileAtiende para destrabar su pensión';
    } else {
      a.proceso_ciudadano = 'Fiscalización laboral, contratos y finiquitos electrónicos de trabajadores';
      a.proceso_bloqueado_en_silo = 'El trabajador no puede cobrar su finiquito o seguro de cesantía si la DT no cruza cotizaciones';
    }
  }
  // Transporte y Movilidad
  else if (['mtt'].includes(orig) || ['mtt'].includes(dest)) {
    a.eje_tematico = 'transporte_movilidad';
    a.proceso_ciudadano = 'Renovación del Permiso de Circulación, multas de tránsito y registro de vehículos';
    a.proceso_bloqueado_en_silo = 'El conductor queda impedido de pagar su permiso de circulación si multas ya pagadas no se eliminan del registro';
  }
  // Educación
  else if (['mineduc', 'subesup', 'junaeb', 'demre', 'ingresa', 'supereduc', 'junji'].includes(orig) || ['mineduc', 'subesup', 'junaeb', 'demre', 'ingresa', 'supereduc', 'junji'].includes(dest)) {
    a.eje_tematico = 'educacion_becas';
  }
  // Salud
  else if (['minsal', 'fonasa', 'suseso', 'supersalud', 'isp', 'compin', 'cenabast'].includes(orig) || ['minsal', 'fonasa', 'suseso', 'supersalud', 'isp', 'compin', 'cenabast'].includes(dest)) {
    a.eje_tematico = 'salud_seguridad_social';
  }
  // Protección Social
  else if (['mdsf', 'fosis', 'senama', 'senadis', 'injuv', 'mejorninez', 'minmujer'].includes(orig) || ['mdsf', 'fosis', 'senama', 'senadis', 'injuv', 'mejorninez', 'minmujer'].includes(dest)) {
    a.eje_tematico = 'proteccion_social';
  }
  // Justicia y Seguridad
  else if (['pjud', 'fiscalia', 'defensoria', 'carabineros', 'pdi', 'gendarmeria', 'sermig', 'minjusticia', 'apdp', 'anci'].includes(orig) || ['pjud', 'fiscalia', 'defensoria', 'carabineros', 'pdi', 'gendarmeria', 'sermig', 'minjusticia', 'apdp', 'anci'].includes(dest)) {
    a.eje_tematico = 'justicia_seguridad';
  }
  // Finanzas y Tributario
  else if (['sii', 'tgr', 'dipres', 'hacienda', 'chilecompra', 'cmf', 'bcch', 'aduana', 'pasarela_tgr'].includes(orig) || ['sii', 'tgr', 'dipres', 'hacienda', 'chilecompra', 'cmf', 'bcch', 'aduana', 'pasarela_tgr'].includes(dest)) {
    a.eje_tematico = 'finanzas_tributario';
  }
  // Identidad
  else if (['srcei', 'claveunica', 'sgd', 'docdigital', 'notificaciones'].includes(orig) || ['srcei', 'claveunica', 'sgd', 'docdigital', 'notificaciones'].includes(dest)) {
    a.eje_tematico = 'identidad_ciudadana';
  }
  else {
    a.eje_tematico = 'transporte_movilidad';
  }
});

// Arista clave DT -> IPS para finiquito y asignaciones
if (!data.aristas.some((a: any) => a.id === 'dt-ips-finiquitos-prevision')) {
  data.aristas.push({
    id: 'dt-ips-finiquitos-prevision',
    origen: 'dt',
    destino: 'ips',
    plataforma_o_bus: 'Web Services DT-IPS / PISEE',
    tipo_dato: 'Registro Electrónico Laboral (Finiquitos y Término de Relación Laboral)',
    eje_tematico: 'trabajo_pensiones',
    proceso_ciudadano: 'Cobro ágil del Seguro de Cesantía y tramitación de pensiones sin finiquito físico',
    proceso_bloqueado_en_silo: 'El trabajador cesante debe ir presencialmente a una notaría y luego a la AFC con papeles impresos',
    estandar_o_protocolo: 'REST / JSON',
    nivel_apertura: 'Restringido interinstitucional',
    fuente_oficial_url: 'https://www.dt.gob.cl/portal/1628/w3-propertyvalue-23985.html',
    brecha_observada: 'Consumo aún parcial en faenas y empleadores rezagados que no declaran contratos en línea.',
    severity: 'moderada',
    normative_ref: 'Art. 8 DS N° 12/2023',
    frecuencia_actualizacion: 'Tiempo real / sincrónico',
    canal: 'Convenio',
    madurez_tecnica: 'realtime',
    involucra_datos_personales: true,
    categoria_datos_personales: ['identificatorios', 'economicos_tributarios']
  });
}

// Arista MTT -> Municipalidades para Permisos de Circulación
if (!data.aristas.some((a: any) => a.id === 'mtt-municipalidades-permisos-transito')) {
  data.aristas.push({
    id: 'mtt-municipalidades-permisos-transito',
    origen: 'mtt',
    destino: 'municipalidades',
    plataforma_o_bus: 'Plataforma Nacional de Tránsito MTT',
    tipo_dato: 'Registro de Revisiones Técnicas Aprobadas, Homologaciones y Estado de Transporte',
    eje_tematico: 'transporte_movilidad',
    proceso_ciudadano: 'Pago expedito del Permiso de Circulación en línea sin llevar el cartón de la revisión técnica',
    proceso_bloqueado_en_silo: 'El contribuyente debe imprimir el certificado de revisión técnica y llevarlo a la caseta municipal',
    estandar_o_protocolo: 'REST / JSON',
    nivel_apertura: 'Público',
    fuente_oficial_url: 'https://www.mtt.gob.cl/prt-en-linea',
    brecha_observada: 'Algunas plantas de revisión técnica en regiones operan con sincronización diferida diaria (batch).',
    severity: 'moderada',
    normative_ref: 'Art. 4 DS N° 12/2023',
    frecuencia_actualizacion: 'Near-real-time',
    canal: 'Convenio',
    madurez_tecnica: 'realtime'
  });
}

fs.writeFileSync(datasetPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Migración a 9 ejes completada con éxito.');
console.log('Total nodos:', data.nodos.length);
console.log('Total aristas:', data.aristas.length);
