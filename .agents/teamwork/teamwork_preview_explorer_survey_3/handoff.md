# Reporte de Arquitectura Frontend: Visualizador Interactivo de Interoperabilidad del Estado Chileno (Astro + Tailwind + Graph Engine)

**Fecha:** 2026-09-29  
**Autor:** `teamwork_preview_explorer_survey_3` (Frontend Architect & Visualizer Specialist)  
**Destinatario:** `teamwork_preview_orchestrator_1` (`c59c7e43-9ca0-4fdd-9339-81f86ae6d22a`)  
**Proyecto:** P029 - Interoperabilidad Estado Chileno  
**Directorio de trabajo:** `D:/Proyectos/P029 - Interoperabilidad Estado Chileno/.agents/teamwork/teamwork_preview_explorer_survey_3`  

---

## 1. Observation (Observaciones Directas y Evidencia)

### 1.1 Mandato Original y Requerimientos de Frontend (R3 y R4)
De acuerdo a `D:/Proyectos/P029 - Interoperabilidad Estado Chileno/.agents/teamwork/ORIGINAL_REQUEST.md`:
- **Líneas 23-29 (R3. Visualizador Web Interactivo en Astro):**
  > "Desarrollar la aplicación web en Astro + Tailwind CSS.  
  > Integrar una isla interactiva de visualización de grafo (usando Cytoscape.js, Vis-network o D3) con renderizado fluido:  
  > - Nodos coloreados por tipología institucional (Ministerio, Servicio, Municipio, Bus transversal).  
  > - Aristas con etiquetas de protocolo/plataforma.  
  > - Controles de zoom, paneo, centrado y búsqueda/filtrado interactivo en tiempo real (por institución, por estándar o por estado de integración).  
  > - Panel lateral o modal informativo al hacer click en nodos o aristas mostrando su ficha técnica, fuentes oficiales y brechas."
- **Líneas 31-35 (R4. Cumplimiento de Arnés MyWorld y Build Estático):**
  > "Compilación estática limpia (`astro build`) que genere un build distribuible en `/dist` listo para despliegue en Coolify / Cloudflare Pages / evegat.cl."
- **Líneas 42-46 (Criterios de Aceptación Frontend):**
  > "- [ ] `astro build` genera la salida estática en `dist/` sin advertencias críticas ni errores.  
  > - [ ] El grafo interactivo es completamente operable en el navegador: permite zoom, arrastrar nodos y hacer click en un nodo/arista para desplegar sus detalles.  
  > - [ ] Los filtros por tipo de institución o estándar actualizan el grafo en tiempo real sin recargar la página."

### 1.2 Visión de Producto y Referentes en el Vault de Obsidian
- En `c:/Users/evega/OneDrive/Documents/Obsidian/MyWorld/2 - Project/P029 - Interoperabilidad Estado Chileno/00 - Home.md` (Línea 20):
  > "Construir una herramienta o mapa analitico para observar la interoperabilidad del Estado chileno: sistemas, instituciones, tramites, estandares, integraciones, brechas y evidencia publica disponible."
- En `01 - Bitacora.md` (Líneas 3-6 y 13-14):
  > "Visualizador de Ecosistema tipo Graphifi: Mostrar cómo se vinculan las instituciones públicas en términos de datos, contratos de interoperación, visiones y recursos como un grafo interactivo de nodos. Despliegue planeado: Hostinger / Web app interactiva."

### 1.3 Entorno de Ejecución Local y Herramientas del Sistema
- `node --version` verificado: `v24.12.0`
- `npm --version` verificado: `11.6.2`
- Sistema Operativo: Windows 11 (soporta Astro v4 / v5, Vite y Tailwind CSS sin emulaciones intermedias).

---

## 2. Logic Chain (Cadena de Razonamiento Arquitectónico)

### 2.1 Evaluación Comparativa de Librerías de Visualización de Grafos

Se evaluaron tres candidatos principales frente a los requerimientos de la aplicación: **Cytoscape.js**, **Vis-network** y **D3.js (Force-directed)**.

| Criterio de Evaluación | Cytoscape.js (v3.x) | Vis-network (v9.x) | D3.js (d3-force + d3-zoom) |
| :--- | :--- | :--- | :--- |
| **Tamaño de Bundle (min+gzip)** | **~35 KB** core (110 KB minificado) | ~160 KB gzip (700 KB minificado) | **~25 KB** gzip (modular) |
| **Motor de Renderizado** | **HTML5 Canvas Multicapa** (separación de fondo, arrastre, nodos y overlays) | HTML5 Canvas Monolítico | SVG (DOM nativo) o Canvas manual |
| **Rendimiento Zoom/Pan (60fps)** | **Excelente**: aceleración por hardware nativa en canvas, optimización de bounding box | Buena en desktop; propensa a lag en canvas unificado con miles de elementos | Regular en SVG con >150 elementos en DOM; excelente en Canvas pero requiere código manual |
| **Eventos de Click/Hover** | **Nativos y Precisos**: `cy.on('tap', 'node')`, `cy.on('tap', 'edge')`, hit-testing a nivel de píxel | Nativos: `network.on('click')`, pero detección de click en aristas curvas solapadas es imprecisa | En SVG: eventos DOM estándar; en Canvas: requiere implementar hit-testing manual (quadtree/distancia) |
| **Estabilidad de Física y Layout** | **Sobresaliente**: algoritmos `cose` (Compound Spring Embedder) y `breadthfirst` convergen a equilibrio finito; evento `layoutstop` explícito | Barnes-Hut continuo: nodos rebotan y oscilan continuamente a menos que se fuerce `stabilization` | Simulación continua con `alphaDecay`: requiere ajuste manual de tick loops y arrastre continuo |
| **Modelo de Estilos** | **Declarativo CSS-like**: selectores tipo `node[typology = "Ministerio"]` con propiedades reactivas | Imperativo: gran objeto de configuración anidado | Imperativo manual vía D3 chained calls |
| **Integración Astro SSG** | **Limpia**: modular en cliente, desacoplada de SSR si se carga en runtime | Requiere lazy-load pesado de 700KB | Requiere código SVG/Canvas personalizado |
| **Curva de Desarrollo / Riesgo** | **Bajo riesgo**: API madura para análisis de redes | Medio riesgo: bundle pesado y física oscilante | **Alto riesgo**: 250+ líneas de cálculo geométrico para flechas, curvas y selección |

#### Veredicto y Selección: **Cytoscape.js**
- **Por qué Cytoscape.js es superior para P029:**
  1. **Canvas multicapa de alto rendimiento:** Mantiene 60 FPS estables al hacer zoom y paneo sobre el mapa institucional.
  2. **Estabilidad física determinista:** El layout `cose` (Compound Spring Embedder) resuelve el grafo en 200–500 ms, alcanza equilibrio y se detiene automáticamente. Esto evita que los nodos vibren continuamente consumiendo CPU y batería del usuario.
  3. **Selectores tipo CSS:** Permite mapear directamente el modelo de datos de la administración pública (ej. `node[typology = 'Bus transversal'] { background-color: #059669; shape: diamond; }`) de manera limpia y mantenible.
  4. **Consultas de vecindad integradas:** Cuenta con métodos nativos como `node.closedNeighborhood()`, `node.connectedEdges()`, lo que permite destacar con 2 líneas de código las instituciones y flujos conectados al hacer click, atenuando el resto.
  5. **D3 queda descartado** debido al alto costo de desarrollo de flechas, hit-testing de aristas curvas y renderizado manual, lo que aumentaría drásticamente el riesgo de bugs en un MVP.
  6. **Vis-network queda descartada** por su excesivo peso (~700 KB minificado) y su física inestable que desordena el mapa de entidades públicas.

---

### 2.2 Diseño de la Arquitectura de Islas en Astro (Zero SSR Mismatch)

#### El Problema de SSR en Aplicaciones de Grafos
Astro compila en tiempo de compilación (`astro build`) ejecutándose sobre Node.js. Si un componente o librería intenta acceder a `window`, `document`, `navigator` o crear un `<canvas>` durante la fase de evaluación del servidor:
```text
ReferenceError: window is not defined
```
Además, si un framework de frontend (como React o Vue) genera HTML en el servidor que difiere del DOM que Cytoscape monta en el cliente, se produce un *Hydration Mismatch Error*.

#### La Solución Arquitectónica: "Vanilla TypeScript Client Island"
Para garantizar un build 100% estático, cero dependencias de servidor en tiempo de ejecución y cero errores de hidratación, se adopta el patrón de **Módulo Cliente Nativo con TypeScript en Astro**:

```
src/
├── components/
│   ├── Header.astro           <- Componente Astro estático (SSR pre-renderizado, 0 KB JS)
│   ├── FilterBar.astro        <- Controles UI estáticos con data-attributes (0 KB JS de framework)
│   ├── GraphViewport.astro    <- Contenedor HTML del Canvas con HUD de controles y skeleton loader
│   ├── DetailDrawer.astro     <- Panel lateral pre-renderizado (oculto vía CSS/Tailwind)
│   └── Legend.astro           <- Leyenda visual estática de tipologías y protocolos
├── lib/
│   ├── graph-controller.ts    <- Controlador cliente en TypeScript puro (gestiona Cytoscape y eventos)
│   ├── graph-styles.ts        <- Hoja de estilos declarativa de Cytoscape
│   └── state-store.ts         <- Almacén reactivo liviano en memoria (o nanostores)
├── data/
│   └── interoperabilidad.json <- Dataset semilla único (fuente de verdad)
└── pages/
    └── index.astro            <- Orquestador de la vista principal
```

#### Mecanismo de Aislamiento y Montaje Seguro
1. En `GraphViewport.astro`, se declara únicamente el contenedor estructural en HTML con clases de Tailwind:
   ```html
   <div id="graph-container" class="relative w-full h-[calc(100vh-140px)] bg-slate-950 overflow-hidden">
     <div id="cy" class="w-full h-full"></div>
     <div id="graph-loader" class="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-20">
       <span class="text-slate-300 animate-pulse text-sm">Cargando ecosistema de interoperabilidad...</span>
     </div>
   </div>
   ```
2. La carga del grafo se delega a un tag `<script>` dentro de Astro:
   ```astro
   <script>
     import { initGraphApp } from '../lib/graph-controller';
     // Se ejecuta EXCLUSIVAMENTE en el navegador del cliente tras el evento DOMContentLoaded
     if (typeof window !== 'undefined') {
       window.addEventListener('DOMContentLoaded', () => {
         initGraphApp();
       });
     }
   </script>
   ```
3. **Por qué esto es 100% seguro en Astro:**
   - En Astro, los scripts estándar dentro de los archivos `.astro` (sin la directiva `is:inline`) son procesados automáticamente por Vite como módulos ES empaquetados para el cliente.
   - Vite los extrae a un archivo bundle independiente cargado con `<script type="module" src="...">`.
   - **Astro NUNCA ejecuta estos bloques `<script>` durante `astro build` en Node.js**.
   - Resultado: Compilación estática impecable, sin fallos de `window is not defined`, y sin la sobrecarga de 130 KB del runtime de React.

---

### 2.3 Diseño de la Experiencia de Usuario (UI/UX) y Componentes

La interfaz sigue las directrices estéticas del Estado chileno (tonos Slate y Azul Institucional con acentos semánticos para estándares y brechas):

```
+---------------------------------------------------------------------------------------------------+
| HEADER: Interoperabilidad Estado Chileno [P029 MVP]       [Buscador: Institución / Bus... (Ctrl+K)]|
| Metricas: [15 Nodos] [22 Flujos] [3 Buses Centrales] [58% REST] [32% SOAP Legacy] [6 Brechas]    |
+---------------------------------------------------------------------------------------------------+
| BARRA DE FILTROS:                                                                                 |
| Tipologia: [x] Todos [x] Ministerio [x] Servicio [x] Bus Transversal [x] Municipio [x] Autonomo   |
| Protocolo: [x] Todos [ ] REST/JSON  [ ] SOAP/XML  [ ] SFTP/Batch   Apertura: [ Todos v ]          |
| [!] Switch: "Solo mostrar flujos con Brecha Observada"              [ Botón: Limpiar Filtros ]    |
+-----------------------------------------------------------------------------------+---------------+
| VIEWPORT DEL GRAFO INTERACTIVO (Cytoscape Canvas)                                  | DETAIL DRAWER |
|                                                                                   | (Slide-over)  |
|   [HUD Flotante]                                  (Bus Central)                   | Ficha Tecnica |
|   [ + ] Zoom In                                     [ PISEE ]                     | Institucion / |
|   [ - ] Zoom Out                                  /     |     \                   | Flujo         |
|   [ ⛶ ] Ajustar                                  /      |      \                  |               |
|   [ ↺ ] Reordenar                              (REST) (SOAP)  (REST)              | Protocolo:    |
|   [ ⏸ ] Congelar                              /        |        \                 | REST / OpenAPI|
|                                       [SRCeI]       [SII]      [FONASA]           | Brecha:       |
|                                         \             /                           | "Sin API en   |
|                                          \---(SFTP)--/                            | tiempo real"  |
|                                                                                   |               |
|   [LEYENDA FLOTANTE]                                                              | Fuente:       |
|   * Azul: Servicio  * Verde: Bus  * Violeta: Ministerio  * Rojo: Brecha           | [Ver Enlace]  |
+-----------------------------------------------------------------------------------+---------------+
```

#### 1. Header (`Header.astro`)
- **Identidad institucional:** Título claro, badge de versión ("P029 · Ecosistema v1.0") y acceso a documentación metodológica.
- **Buscador interactivo (Typeahead):** Input de búsqueda instantánea con autocompletado en tiempo real. Al tipear "Civil", resalta en el desplegable "Servicio de Registro Civil e Identificación (SRCeI)". Al seleccionarlo, la cámara de Cytoscape se desplaza automáticamente hacia el nodo con zoom animado:
  ```ts
  cy.animate({ center: { eles: node }, zoom: 1.6, duration: 400 });
  ```
- **Píldoras de Métricas Globales (Summary KPIs):**
  - Conteo total de entidades públicas activas.
  - Conteo total de convenios/flujos de intercambio.
  - Cantidad de buses centrales operando (PISEE, ClaveÚnica, DocDigital).
  - Índice de modernización (% de integraciones REST vs SOAP/Batch).
  - Cantidad de brechas críticas identificadas.

#### 2. Barra de Filtros (`FilterBar.astro`)
- **Filtro por Tipología Institucional:** Permite activar/desactivar tipos de nodo:
  - `Ministerio` (Color Índigo `#4f46e5`)
  - `Servicio Público` (Color Azul `#2563eb`)
  - `Bus Transversal` (Color Esmeralda `#059669`, forma diamante)
  - `Municipio` (Color Ámbar `#d97706`, forma rectángulo)
  - `Órgano Autónomo` (Color Púrpura `#7c3aed`, forma octágono)
- **Filtro por Protocolo / Estándar:**
  - `REST / JSON`: Línea continua verde con punta de flecha.
  - `SOAP / XML (WSDL)`: Línea discontinua amarilla con punta de flecha.
  - `SFTP / Lotes Nocturnos`: Línea punteada naranja con flecha bidireccional.
  - `Convenio Manual / Humano`: Línea discontinua roja.
- **Filtro por Nivel de Apertura:** (Público, Convenio Bilateral, Reservado/Seguridad Nacional).
- **Filtro de Impacto / Brecha Crítica:** Toggle de alto contraste para aislar únicamente las conexiones del Estado chileno que sufren fallas, asincronías o falta de estandarización.

#### 3. Viewport del Grafo (`GraphViewport.astro`)
- Lienzo de pantalla completa con fondo de alto contraste (`bg-slate-950`).
- **HUD Flotante de Navegación:**
  - `+` / `-` : Control de zoom escalonado con animación suave.
  - `[ ⛶ ] Fit`: Reencuadra todos los nodos visibles con un margen de seguridad (`padding: 50`).
  - `[ ↺ ] Reset Layout`: Vuelve a calcular el layout `cose` para desempatar nodos si el usuario los movió manualmente.
  - `[ ⏸ ] Freeze/Pin`: Fija las posiciones para evitar movimientos accidentales al arrastrar el mouse.
- **Leyenda Flotante Colapsable:** Ubicada en la esquina inferior derecha, detalla la codificación visual de colores de nodos y tipos de línea de aristas.

#### 4. Panel Lateral de Detalle / Drawer (`DetailDrawer.astro`)
Panel deslizable con animación CSS (`transition-transform duration-300 ease-in-out`), optimizado para escritorio (ancho fijo de 420px a la derecha) y dispositivos móviles (bottom sheet de 70vh).

- **Modo Ficha de Institución (Click en Nodo):**
  - Nombre formal, sigla oficial y badge de tipología.
  - Rol funcional en el ecosistema del Estado.
  - Marco normativo de interoperabilidad (ej. Ley 21.180, DFL 1/2020 Segpres).
  - Estadísticas locales: Número de datos provistos (grado de salida) y datos consumidos (grado de entrada).
  - Lista de contrapartes conectadas (con enlaces interactivos que al hacer click re-enfocan la contraparte en el grafo).
  - Brechas y cuellos de botella detectados en esa institución.
  - Enlaces a fuentes oficiales (portales de API, resoluciones o catálogos públicos).
- **Modo Ficha de Flujo / Interoperabilidad (Click en Arista):**
  - Par interinstitucional: `Origen` ➔ `Destino`.
  - Plataforma o Bus utilizado (ej. "PISEE - Plataforma de Interoperabilidad del Estado" o "Conexión Directa Bilateral").
  - Dato transaccionado (ej. "Certificado de Matrimonio y Nacimiento", "RUT y Datos Biográficos", "Declaración de Renta Formulario 22").
  - Protocolo técnico y formato (REST/JSON, SOAP/XML, Webhook).
  - Nivel de apertura y seguridad (autenticación mTLS, OAuth2, API Key, Token ClaveÚnica).
  - Brecha documentada (ej. "Transferencia por lotes cada 24 hrs que impide validación en línea").
  - Botón directo con enlace a la fuente oficial verificable.

---

### 2.4 Gestión de Estado y Ciclo de Vida de Eventos

Para asegurar máxima reactividad sin dependencias externas pesadas, se implementa una arquitectura basada en eventos desacoplados:

```
[Usuario interactúa]
   │
   ├─► Escribe en Buscador ───► Evento 'app:search' ───► Cytoscape: anima cámara hacia nodo
   │
   ├─► Cambia un Filtro ──────► Evento 'app:filter' ───► Cytoscape: `cy.batch()` muestra/oculta elementos
   │                                                 └─► Header: recalcula métricas visibles
   │
   ├─► Click en Nodo ─────────► Cytoscape: 'tap node' ─► Atenúa nodos no conectados
   │                                                 └─► Drawer: renderiza Ficha Institucional y abre panel
   │
   ├─► Click en Arista ───────► Cytoscape: 'tap edge' ─► Resalta arista y extremos
   │                                                 └─► Drawer: renderiza Ficha de Flujo y abre panel
   │
   └─► Click en Fondo ────────► Cytoscape: 'tap' canvas ► Restaura opacidad 100% y cierra Drawer
```

#### Código Esquemático de Filtrado en Tiempo Real (Alto Rendimiento)
```ts
export function applyFilters(cy: cytoscape.Core, filters: FilterState) {
  cy.batch(() => {
    cy.elements().forEach(ele => {
      let visible = true;
      if (ele.isNode()) {
        const typology = ele.data('typology');
        if (filters.typologies.size > 0 && !filters.typologies.has(typology)) {
          visible = false;
        }
        if (filters.searchQuery) {
          const label = (ele.data('label') || '').toLowerCase();
          const name = (ele.data('name') || '').toLowerCase();
          if (!label.includes(filters.searchQuery) && !name.includes(filters.searchQuery)) {
            visible = false;
          }
        }
      } else if (ele.isEdge()) {
        const protocol = ele.data('protocol');
        if (filters.protocols.size > 0 && !filters.protocols.has(protocol)) {
          visible = false;
        }
        if (filters.onlyBottlenecks && !ele.data('brecha_observada')) {
          visible = false;
        }
      }
      ele.style('display', visible ? 'element' : 'none');
    });
  });
}
```

---

### 2.5 Verificación de Restricciones de Build y Despliegue Estático

1. **Configuración de Astro (`astro.config.mjs`):**
   ```js
   import { defineConfig } from 'astro/config';
   import tailwind from '@astrojs/tailwind';

   export default defineConfig({
     output: 'static',
     integrations: [tailwind()],
     build: {
       format: 'directory'
     }
   });
   ```
2. **Generación 100% Estática en `/dist`:**
   - La ejecución de `npm run build` ejecutará `astro build`.
   - Astro emite archivos puramente estáticos (`index.html`, assets CSS optimizados, chunks JS minificados para el cliente).
   - No requiere ningún proceso Node.js, SSR adapter ni servidor activo en producción.
   - Es directamente desplegable en Nginx, Apache, Cloudflare Pages, Coolify Static Site, o bajo un subdirectorio en `evegat.cl/p029/`.
3. **Cero Dependencias de Red en Ejecución (Offline Capable):**
   - El dataset `interoperabilidad.json` se importa directamente en el bundle estático.
   - La aplicación no depende de ninguna API externa viva que pueda fallar o tener caídas de red durante una demostración.

---

## 3. Caveats (Advertencias, Supuestos y Límites)

1. **Librería Cytoscape y Soporte de Toque Móvil:**
   - Cytoscape maneja gestos multitáctiles (pinch-to-zoom y two-finger pan) de forma nativa. Sin embargo, en pantallas de teléfonos muy pequeñas (< 380px de ancho), visualizar grafos densos de más de 25 nodos puede resultar apretado. Para estos dispositivos, el diseño contempla un botón de acceso directo a "Vista de Tabla / Ficha" como alternativa accesible.
2. **Dependencia de Módulos ES:**
   - La librería Cytoscape debe instalarse vía npm (`npm install cytoscape @types/cytoscape`) para que Vite empaquete y optimice el código eficientemente sin recurrir a CDNs externos no versionados.
3. **Evolución del Dataset:**
   - El visualizador asume que el dataset semilla generado por el agente Spec Miner cumplirá con el esquema unificado (`id`, `nombre`, `sigla`, `tipologia`, `rol`, etc. para nodos; `origen`, `destino`, `plataforma_o_bus`, `tipo_dato`, `estandar_o_protocolo`, `nivel_apertura`, `fuente_oficial_url`, `brecha_observada` para aristas). Cualquier cambio en los nombres de atributos debe reflejarse en `src/lib/graph-styles.ts`.

---

## 4. Conclusion (Plan de Implementación y Recomendaciones)

### 4.1 Resumen Ejecutivo de la Arquitectura Aprobada
- **Motor de Grafo:** **Cytoscape.js** v3.x con layout `cose`. Se prioriza por su renderizado multicapa en Canvas, bajo peso (~35 KB gzipped), física determinista y sistema de selectores CSS.
- **Patrón de Integración:** **Astro Vanilla TypeScript Island**. Cero frameworks de UI pesados en el cliente (0 KB React/Vue), 100% seguro contra fallos de SSR en Node.js, empaquetado nativo con Vite.
- **Estilos y Diseño:** **Tailwind CSS** con paleta inspirada en el Estado chileno (Slate 900/950, Azul Gob, acentos esmeralda para buses y rojo/ámbar para brechas).
- **Despliegue:** Salida estática pura en `dist/` generada por `astro build`.

### 4.2 Árbol de Archivos Frontend Recomendado
```
D:/Proyectos/P029 - Interoperabilidad Estado Chileno/
├── package.json               # Dependencias: astro, @astrojs/tailwind, tailwindcss, cytoscape, @types/cytoscape
├── astro.config.mjs           # output: 'static', integrations: [tailwind()]
├── tailwind.config.mjs        # Configuración de colores institucionales y extensiones
├── tsconfig.json              # Configuración TypeScript para Astro
├── src/
│   ├── layouts/
│   │   └── Layout.astro       # Layout HTML base con metadata SEO, fuentes y viewport
│   ├── pages/
│   │   └── index.astro        # Página principal: monta Header, FilterBar, Viewport y Drawer
│   ├── components/
│   │   ├── Header.astro       # Barra de navegación superior con buscador y métricas
│   │   ├── FilterBar.astro    # Barra de filtros interactivos
│   │   ├── GraphViewport.astro# Contenedor del grafo con HUD de controles
│   │   ├── DetailDrawer.astro # Panel lateral de detalles (institución o flujo)
│   │   └── Legend.astro       # Leyenda de símbolos y colores
│   ├── lib/
│   │   ├── graph-controller.ts# Lógica de instanciación de Cytoscape, eventos y filtros
│   │   ├── graph-styles.ts    # Estilos declarativos de nodos y aristas para Cytoscape
│   │   └── types.ts           # Interfaces TypeScript de nodos, aristas y estado
│   └── data/
│       └── interoperabilidad.json # Dataset de nodos y aristas (provisto por Spec Miner)
```

### 4.3 Dependencias Necesarias para el `package.json`
```json
{
  "dependencies": {
    "@astrojs/tailwind": "^5.1.0",
    "astro": "^4.16.0",
    "cytoscape": "^3.30.0",
    "tailwindcss": "^3.4.1"
  },
  "devDependencies": {
    "@types/cytoscape": "^3.19.16",
    "@types/node": "^20.17.0",
    "typescript": "^5.6.0"
  }
}
```

---

## 5. Verification Method (Método de Verificación Independiente)

Para verificar independientemente las conclusiones y el funcionamiento de esta arquitectura:

1. **Verificación de Empaquetado y Ausencia de Errores SSR:**
   - Ejecutar en la raíz del proyecto:
     ```bash
     npx astro build
     ```
   - **Criterio de éxito:** Código de salida 0, generación de `dist/index.html` y bundles estáticos en `dist/_astro/` sin advertencias de `window is not defined`.
2. **Verificación de la Salida Estática y Despliegue Local:**
   - Ejecutar la previsualización del build estático puro:
     ```bash
     npx astro preview
     ```
   - Abrir el navegador en `http://localhost:4321`.
   - **Criterio de éxito:** El grafo interactivo carga de inmediato con los 15+ nodos, el layout `cose` se estabiliza, los botones de zoom y ajuste funcionan con suavidad a 60 FPS.
3. **Verificación de Interacciones Funcionales:**
   - Hacer click en el nodo "PISEE" ➔ El Drawer lateral se abre inmediatamente mostrando la ficha del bus transversal y las conexiones directas. El resto del grafo se atenúa al 15% de opacidad.
   - Marcar el filtro "Solo mostrar flujos con Brecha Observada" ➔ El grafo filtra dinámicamente y muestra solo las aristas con alertas de cuellos de botella sin recargar la página.
   - Probar el buscador tipear "TGR" ➔ La cámara centra automáticamente la Tesorería General de la República.
4. **Condiciones de Invalidación:**
   - Si se intenta importar Cytoscape en el frontmatter del servidor (entre `---`) en lugar del bloque de script de cliente, el build estático fallará con `window is not defined`.
   - Si se escoge Vis-network, el bundle aumentará en >600 KB y la estabilización de física introducirá latencia observable en dispositivos móviles.
