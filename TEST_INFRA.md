# Infraestructura y Arquitectura de Pruebas E2E (P029)

**Proyecto:** P029 - Interoperabilidad Estado Chileno  
**Metodología:** Dual Track (Requirement-Driven Opaque-Box Testing & 4-Tier Verification)  
**Motor de Ejecución:** Node.js v24 LTS (`node:test`, `node:assert/strict`) + `tsx` (TypeScript Execution Engine)  
**Ubicación:** `tests/e2e/`

---

## 1. Filosofía y Enfoque de Pruebas (Dual Track)

La suite de pruebas E2E de P029 implementa una verificación opaca orientada estrictamente a requerimientos. No asume detalles internos volátiles de la implementación, sino que valida los contratos de datos, reglas topológicas de teoría de grafos, comportamientos de la interfaz de usuario y flujos reales de la administración pública chilena definidos en `ORIGINAL_REQUEST.md` y `PROJECT.md`.

### Niveles de la Pirámide E2E (4 Tiers)

```
                    ┌─────────────────────────────────────────┐
                    │  Tier 4: Flujos Públicos Reales E2E     │ (5 tests)
                    │  Bono Social, Compras Públicas, LME,    │
                    │  Operación Renta, DocDigital territorial│
                    ├─────────────────────────────────────────┤
                    │  Tier 3: Combinaciones Cross-Feature    │ (5 tests)
                    │  Filtro + Búsqueda, Protocolo + Brecha, │
                    │  Contratos de Drawer y Reset de Estado  │
                    ├─────────────────────────────────────────┤
                    │  Tier 2: Límites, Bordes y Corner Cases │ (7 tests)
                    │  Nodos huérfanos, enlaces rotos, URLs   │
                    │  inválidas, estados vacíos y caracteres │
                    ├─────────────────────────────────────────┤
                    │  Tier 1: Cobertura de Requerimientos    │ (5 tests)
                    │  Esquema JSON, semilla >=12-15 aristas, │
                    │  Validador exit code 0, Build estático  │
                    └─────────────────────────────────────────┘
```

---

## 2. Comandos de Ejecución

Todos los scripts pueden ejecutarse de manera independiente o consolidada desde la raíz del proyecto:

### 2.1 Ejecución Consolidada (Suite Completa)
```bash
# Ejecutar los 4 Tiers con reporte ejecutivo y medición de tiempos
npx tsx tests/e2e/test-runner.ts
```

### 2.2 Ejecución por Tier Individual
```bash
# Tier 1: Cobertura de Requerimientos y Esquema
npx tsx tests/e2e/test-runner.ts --tier 1

# Tier 2: Casos de Borde e Integridad Topológica
npx tsx tests/e2e/test-runner.ts --tier 2

# Tier 3: Interacciones Cruzadas y Sincronización de UI
npx tsx tests/e2e/test-runner.ts --tier 3

# Tier 4: Trazabilidad de Flujos Reales del Estado
npx tsx tests/e2e/test-runner.ts --tier 4
```

### 2.3 Ejecución Directa con Node Test Runner
```bash
# Ejecución nativa por archivo de prueba
npx tsx --test tests/e2e/tier1-feature-coverage.test.ts
npx tsx --test tests/e2e/tier2-boundary-corners.test.ts
npx tsx --test tests/e2e/tier3-cross-feature.test.ts
npx tsx --test tests/e2e/tier4-public-workflows.test.ts
```

---

## 3. Estructura de Directorios

```
D:/Proyectos/P029 - Interoperabilidad Estado Chileno/
├── TEST_INFRA.md                          # Documento de arquitectura de pruebas (este archivo)
├── TEST_READY.md                          # Matriz de cobertura y estado de aceptación
├── tests/
│   └── e2e/
│       ├── test-helpers.ts                # Utilidades: clonación aislada, simulación de filtros, BFS path finding
│       ├── tier1-feature-coverage.test.ts # Pruebas Tier 1 (Esquema, Datos, QA Validator, Build)
│       ├── tier2-boundary-corners.test.ts # Pruebas Tier 2 (Mutaciones adversarias, integridad, corner cases)
│       ├── tier3-cross-feature.test.ts    # Pruebas Tier 3 (Filtros combinados, sincronización de drawer)
│       ├── tier4-public-workflows.test.ts # Pruebas Tier 4 (Flujos públicos reales de interoperabilidad)
│       └── test-runner.ts                 # Orquestador CLI principal con badges y reportes
```

---

## 4. Matriz de Cobertura y Checklist de Funcionalidades

| Feature ID | Descripción | Tier Asociada | Archivo de Prueba | Estado |
|:---:|:---|:---:|:---|:---:|
| **F-01** | Esquema formal JSON / TS de nodos y aristas | Tier 1 | `tier1-feature-coverage.test.ts:T1.1` | ✅ PASA |
| **F-02** | Dataset semilla con >= 12-15 relaciones reales | Tier 1 | `tier1-feature-coverage.test.ts:T1.2` | ✅ PASA |
| **F-03** | QA Validator (`npm run test:data`) exit code 0 | Tier 1 | `tier1-feature-coverage.test.ts:T1.3` | ✅ PASA |
| **F-04** | Métricas del grafo (densidad, centralidad, cuellos) | Tier 1 | `tier1-feature-coverage.test.ts:T1.3` | ✅ PASA |
| **F-05** | Contrato de build estático en `dist/` | Tier 1 | `tier1-feature-coverage.test.ts:T1.4` | ✅ PASA |
| **F-06** | Contrato de selectores y elementos core de UI | Tier 1 | `tier1-feature-coverage.test.ts:T1.5` | ✅ PASA |
| **B-01** | Detección y rechazo de nodos huérfanos (Grado 0) | Tier 2 | `tier2-boundary-corners.test.ts:T2.1` | ✅ PASA |
| **B-02** | Detección de enlaces rotos en `destino` | Tier 2 | `tier2-boundary-corners.test.ts:T2.2` | ✅ PASA |
| **B-03** | Detección de enlaces rotos en `origen` | Tier 2 | `tier2-boundary-corners.test.ts:T2.3` | ✅ PASA |
| **B-04** | Rechazo de URLs con esquemas no HTTP/HTTPS | Tier 2 | `tier2-boundary-corners.test.ts:T2.4` | ✅ PASA |
| **B-05** | Manejo de búsqueda vacía, espacios y metacaracteres | Tier 2 | `tier2-boundary-corners.test.ts:T2.5` | ✅ PASA |
| **B-06** | Manejo de combinaciones de filtros extremas/vacías | Tier 2 | `tier2-boundary-corners.test.ts:T2.6` | ✅ PASA |
| **B-07** | Detección y advertencia de bucles autorreferenciales | Tier 2 | `tier2-boundary-corners.test.ts:T2.7` | ✅ PASA |
| **CF-01** | Concurrencia de filtro tipología + búsqueda texto | Tier 3 | `tier3-cross-feature.test.ts:T3.1` | ✅ PASA |
| **CF-02** | Filtro de protocolo + toggle de brechas observadas | Tier 3 | `tier3-cross-feature.test.ts:T3.2` | ✅ PASA |
| **CF-03** | Contrato de ficha técnica institucional (Nodo) | Tier 3 | `tier3-cross-feature.test.ts:T3.3` | ✅ PASA |
| **CF-04** | Contrato de ficha técnica de interoperabilidad (Arista) | Tier 3 | `tier3-cross-feature.test.ts:T3.4` | ✅ PASA |
| **CF-05** | Restauración completa de estado al resetear filtros | Tier 3 | `tier3-cross-feature.test.ts:T3.5` | ✅ PASA |
| **W-01** | Flujo Social: Subsidios y Bonos (RSH / MDSF / TGR) | Tier 4 | `tier4-public-workflows.test.ts:T4.1` | ✅ PASA |
| **W-02** | Flujo Transaccional: Mercado Público / SIGFE / TGR | Tier 4 | `tier4-public-workflows.test.ts:T4.2` | ✅ PASA |
| **W-03** | Flujo Sanitario: Licencia Médica LME (SUSESO / FONASA) | Tier 4 | `tier4-public-workflows.test.ts:T4.3` | ✅ PASA |
| **W-04** | Flujo Tributario: Deudores Alimentos Ley 21.389 (SII/TGR) | Tier 4 | `tier4-public-workflows.test.ts:T4.4` | ✅ PASA |
| **W-05** | Flujo Territorial: DocDigital y Gestión Municipal SINIM | Tier 4 | `tier4-public-workflows.test.ts:T4.5` | ✅ PASA |

---

## 5. Garantía de Aislamiento e Independencia

1. **Sin Estado Persistente Mutado:** Ningún test altera los archivos canónicos `src/data/interoperabilidad.json` en disco. Las pruebas adversarias usan `deepClone()` en memoria antes de evaluar el validador.
2. **Determinismo:** Todas las simulaciones y aserciones son deterministas (sin retardos artificiales `sleep()` ni dependencias de reloj no controladas).
3. **Compatibilidad Multiplataforma:** Probado en Windows 11 (PowerShell / CMD) y compatible con Linux / macOS para CI/CD y despliegue en Coolify / Cloudflare Pages.
