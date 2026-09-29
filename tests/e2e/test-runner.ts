#!/usr/bin/env tsx
/**
 * Master E2E Test Runner for P029 - Interoperabilidad Estado Chileno
 * Orchestrates Tiers 1-4 with CLI filtering, progress reporting, and exit code handling.
 * 
 * Usage:
 *   npx tsx tests/e2e/test-runner.ts           # Run all tiers (1-4)
 *   npx tsx tests/e2e/test-runner.ts --tier 1  # Run only Tier 1
 *   npx tsx tests/e2e/test-runner.ts --tier 2  # Run only Tier 2
 *   npx tsx tests/e2e/test-runner.ts --tier 3  # Run only Tier 3
 *   npx tsx tests/e2e/test-runner.ts --tier 4  # Run only Tier 4
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..');

interface TierDefinition {
  id: number;
  name: string;
  file: string;
  description: string;
}

const TIERS: TierDefinition[] = [
  {
    id: 1,
    name: 'Tier 1: Feature Coverage',
    file: 'tests/e2e/tier1-feature-coverage.test.ts',
    description: 'Dataset schema, seed count >=12-15, QA validator exit code 0, static build contract, UI core elements',
  },
  {
    id: 2,
    name: 'Tier 2: Boundary & Corner Cases',
    file: 'tests/e2e/tier2-boundary-corners.test.ts',
    description: 'Orphan node rejection, broken link detection, URL syntax, empty search, extreme filter combinations',
  },
  {
    id: 3,
    name: 'Tier 3: Cross-Feature Combinations',
    file: 'tests/e2e/tier3-cross-feature.test.ts',
    description: 'Typology + search concurrency, protocol + gaps toggle, node & edge drawer payload contracts, filter reset',
  },
  {
    id: 4,
    name: 'Tier 4: Real-World Public Workflows',
    file: 'tests/e2e/tier4-public-workflows.test.ts',
    description: 'Authentic State workflows: Bono Social (RSH), Compra Pública (SIGFE), LME Salud, Retención Alimentos, DocDigital/SINIM',
  },
];

function printBanner() {
  console.log('================================================================================');
  console.log('🏛️  P029: INTEROPERABILIDAD ESTADO CHILENO — MASTER E2E TEST SUITE');
  console.log('    Dual Track Methodology · 4-Tier Verification · Node.js 24 LTS');
  console.log('================================================================================\n');
}

function parseCliArgs(): { targetTiers: TierDefinition[]; help: boolean } {
  const args = process.argv.slice(2);
  let requestedTier: number | null = null;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tier' && args[i + 1]) {
      requestedTier = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      help = true;
    }
  }

  if (help) {
    return { targetTiers: [], help: true };
  }

  if (requestedTier !== null) {
    const matched = TIERS.filter((t) => t.id === requestedTier);
    if (matched.length === 0) {
      console.error(`❌ Error: Tier ${requestedTier} no existe. Válidos: 1, 2, 3, 4.`);
      process.exit(1);
    }
    return { targetTiers: matched, help: false };
  }

  return { targetTiers: TIERS, help: false };
}

function runTier(tier: TierDefinition): {
  success: boolean;
  output: string;
  durationMs: number;
} {
  const startTime = Date.now();
  console.log(`▶ Ejecutando [Tier ${tier.id}] ${tier.name}...`);
  console.log(`  Descripción: ${tier.description}`);
  console.log(`  Archivo:     ${tier.file}\n`);

  try {
    const output = execSync(`npx tsx --test "${tier.file}"`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const durationMs = Date.now() - startTime;
    console.log(output);
    console.log(`✅ [Tier ${tier.id}] APROBADO (${durationMs} ms)\n`);
    console.log('--------------------------------------------------------------------------------\n');
    return { success: true, output, durationMs };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const error = err as { stdout?: string; stderr?: string };
    console.log(error.stdout || '');
    console.error(error.stderr || '');
    console.log(`❌ [Tier ${tier.id}] FALLÓ (${durationMs} ms)\n`);
    console.log('--------------------------------------------------------------------------------\n');
    return { success: false, output: error.stdout || '', durationMs };
  }
}

function main() {
  printBanner();
  const { targetTiers, help } = parseCliArgs();

  if (help) {
    console.log('Uso:');
    console.log('  npx tsx tests/e2e/test-runner.ts           # Ejecuta todas las tiers (1-4)');
    console.log('  npx tsx tests/e2e/test-runner.ts --tier 1  # Solo Tier 1: Feature Coverage');
    console.log('  npx tsx tests/e2e/test-runner.ts --tier 2  # Solo Tier 2: Boundary & Corners');
    console.log('  npx tsx tests/e2e/test-runner.ts --tier 3  # Solo Tier 3: Cross-Feature');
    console.log('  npx tsx tests/e2e/test-runner.ts --tier 4  # Solo Tier 4: Public Workflows\n');
    process.exit(0);
  }

  const results: Array<{ tier: TierDefinition; success: boolean; durationMs: number }> = [];
  let totalDuration = 0;
  let allPassed = true;

  for (const tier of targetTiers) {
    const res = runTier(tier);
    results.push({ tier, success: res.success, durationMs: res.durationMs });
    totalDuration += res.durationMs;
    if (!res.success) {
      allPassed = false;
    }
  }

  // Summary Table
  console.log('================================================================================');
  console.log('📊 RESUMEN EJECUTIVO DE EJECUCIÓN E2E');
  console.log('================================================================================');
  for (const r of results) {
    const statusSymbol = r.success ? '✅ PASS' : '❌ FAIL';
    console.log(
      ` ${statusSymbol} | Tier ${r.tier.id}: ${r.tier.name.padEnd(35, ' ')} | ${String(r.durationMs).padStart(6, ' ')} ms`
    );
  }
  console.log('--------------------------------------------------------------------------------');
  console.log(` Total Tiers Evaluadas: ${results.length}`);
  console.log(` Estado Global:          ${allPassed ? '✅ TODOS LOS TESTS APROBADOS' : '❌ FALLAS DETECTADAS'}`);
  console.log(` Tiempo Total:           ${totalDuration} ms`);
  console.log('================================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main();
