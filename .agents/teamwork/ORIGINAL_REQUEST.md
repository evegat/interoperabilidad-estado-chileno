# Original User Request

## Initial Request — 2026-09-29T06:01:42Z

Construir una aplicación web en Astro con un visualizador interactivo de grafo (estilo Graphifi) y un dataset estructurado y validado que mapee la interoperabilidad del Estado chileno (instituciones públicas, buses como PISEE, flujos de datos, APIs y brechas) a partir de fuentes oficiales verificables.

Working directory: D:/Proyectos/P029 - Interoperabilidad Estado Chileno
Documentation directory: c:/Users/evega/OneDrive/Documents/Obsidian/MyWorld/2 - Project/P029 - Interoperabilidad Estado Chileno
Integrity mode: demo

## Requirements

### R1. Dataset Semilla y Esquema de Interoperabilidad
- Definir un esquema formal en JSON/TypeScript para representar nodos (instituciones públicas y buses centrales) y aristas (flujos de datos, convenios de interoperabilidad, APIs y trámites).
- Construir un dataset semilla con al menos 12 a 15 relaciones reales y trazables del Estado chileno (ej. Registro Civil <-> ClaveÚnica, SII <-> Tesorería, PISEE <-> Municipios/FONASA, Mercado Público <-> DIPRES, SUBDERE), con campos obligatorios: `origen`, `destino`, `plataforma_o_bus`, `tipo_dato`, `estandar_o_protocolo`, `nivel_apertura`, `fuente_oficial_url` y `brecha_observada`.

### R2. Script de Validación y QA de Datos
- Implementar un validador (`npm run test:data` o script Node/TS) que verifique la integridad referencial del grafo:
  - Sin nodos huérfanos ni referencias rotas.
  - Validación estricta de campos obligatorios y formato de URLs.
  - Generación de resumen de métricas del grafo (densidad, instituciones más conectadas, principales cuellos de botella).

### R3. Visualizador Web Interactivo en Astro
- Desarrollar la aplicación web en Astro + Tailwind CSS.
- Integrar una isla interactiva de visualización de grafo (usando Cytoscape.js, Vis-network o D3) con renderizado fluido:
  - Nodos coloreados por tipología institucional (Ministerio, Servicio, Municipio, Bus transversal).
  - Aristas con etiquetas de protocolo/plataforma.
  - Controles de zoom, paneo, centrado y búsqueda/filtrado interactivo en tiempo real (por institución, por estándar o por estado de integración).
  - Panel lateral o modal informativo al hacer click en nodos o aristas mostrando su ficha técnica, fuentes oficiales y brechas.

### R4. Cumplimiento de Arnés MyWorld y Build Estático
- Inicializar el repositorio con `MYWORLD-HARNESS.json` estándar compatible con la cartera MyWorld (vínculo a P029).
- Compilación estática limpia (`astro build`) que genere un build distribuible en `/dist` listo para despliegue en Coolify / Cloudflare Pages / evegat.cl.
- Documentar el estado y resultados en un resumen ejecutivo que se sincronice con la bitácora del proyecto en Obsidian (`2 - Project/P029 - Interoperabilidad Estado Chileno/01 - Bitacora.md`).

## Acceptance Criteria

### Data Integrity & Schema
- [ ] El archivo de datos JSON contiene al menos 12 relaciones interinstitucionales documentadas con evidencia real.
- [ ] El script de validación (`npm run test:data` o equivalente) ejecuta y aprueba con código de salida 0.

### Frontend Application
- [ ] `astro build` genera la salida estática en `dist/` sin advertencias críticas ni errores.
- [ ] El grafo interactivo es completamente operable en el navegador: permite zoom, arrastrar nodos y hacer click en un nodo/arista para desplegar sus detalles.
- [ ] Los filtros por tipo de institución o estándar actualizan el grafo en tiempo real sin recargar la página.

### Harness & Project Sync
- [ ] Archivo `MYWORLD-HARNESS.json` presente en la raíz de `D:/Proyectos/P029 - Interoperabilidad Estado Chileno`.
- [ ] Entrada de cierre registrada en `01 - Bitacora.md` del Vault de Obsidian con el estado del MVP generado.
