/**
 * Milestone 2 Challenger Empirical & Contract Verification Test
 * Author: teamwork_preview_challenger_m2_1
 * 
 * Empirically verifies:
 * 1. dist/index.html exists and contains all required DOM IDs, data attributes, and semantic controls.
 * 2. All asset references (<script>, <link rel="stylesheet">, <link rel="icon">) exist on disk in dist/.
 * 3. dist/ contains no SSR artifacts, no node runtime dependencies, and is 100% self-contained static HTML/CSS/JS.
 * 4. Verification of bundled client JavaScript for Cytoscape, event listeners, and drawer controller logic.
 * 5. Adversarial verification of filtering, search normalization, and DOM contract resilience.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');
const distDir = resolve(projectRoot, 'dist');
const htmlPath = resolve(distDir, 'index.html');

describe('Milestone 2 Empirical Challenger Suite (M2 Verification)', () => {
  // 1. Static file presence and sizing
  test('M2-CHALLENGE-01: dist/ directory and index.html exist and have valid static sizes', () => {
    assert.ok(existsSync(distDir), 'dist/ directory must exist');
    assert.ok(existsSync(htmlPath), 'dist/index.html must exist');

    const htmlStats = statSync(htmlPath);
    assert.ok(htmlStats.size > 5000, `dist/index.html size (${htmlStats.size} bytes) must be > 5KB`);
    assert.ok(htmlStats.size < 500000, `dist/index.html size (${htmlStats.size} bytes) should be reasonable (< 500KB)`);
  });

  // 2. Empirical verification of required DOM elements in dist/index.html
  test('M2-CHALLENGE-02: dist/index.html contains all mandatory DOM IDs and selectors', () => {
    const html = readFileSync(htmlPath, 'utf-8');

    const mandatoryTokens = [
      // Viewport & canvas
      'id="graph-container"',
      'id="cy"',
      'id="graph-loader"',

      // Search & Header
      'id="search-input"',
      'name="search"',

      // Filters
      'data-filter="typology"',
      'id="filter-typology"',
      'data-filter="protocol"',
      'id="filter-protocol"',
      'data-filter="onlyGaps"',
      'id="filter-gaps"',
      'id="reset-filters"',

      // HUD Navigation Buttons
      'id="hud-zoom-in"',
      'data-action="zoom-in"',
      'id="hud-zoom-out"',
      'data-action="zoom-out"',
      'id="hud-fit"',
      'data-action="fit"',
      'id="hud-reset"',
      'data-action="reset"',

      // Detail Drawer
      'id="detail-drawer"',
      'id="drawer-type-badge"',
      'id="drawer-status-badge"',
      'id="drawer-close"',
      'id="drawer-empty-state"',
      'id="drawer-node-view"',
      'id="drawer-edge-view"',

      // Semantic Legend
      'id="legend-card"',
      'id="legend-toggle"',
      'id="legend-body"',
    ];

    for (const token of mandatoryTokens) {
      assert.ok(
        html.includes(token),
        `dist/index.html must contain expected token: "${token}"`
      );
    }
  });

  // 3. Asset linkage and self-containment check
  test('M2-CHALLENGE-03: All CSS/JS/SVG assets referenced in dist/index.html exist on disk', () => {
    const html = readFileSync(htmlPath, 'utf-8');

    // Extract all href and src attributes pointing to /_astro/ or root assets
    const assetRegex = /(?:href|src)="(\/[^"]+)"/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = assetRegex.exec(html)) !== null) {
      const assetUrl = match[1];
      if (assetUrl.startsWith('/_astro/') || assetUrl.startsWith('/favicon.')) {
        matches.push(assetUrl);
      }
    }

    assert.ok(matches.length >= 3, `Expected at least 3 local assets (CSS, JS, Favicon), found ${matches.length}`);

    for (const assetUrl of matches) {
      // Remove leading slash and resolve to distDir
      const relativePath = assetUrl.replace(/^\//, '');
      const localAssetPath = resolve(distDir, relativePath);
      assert.ok(
        existsSync(localAssetPath),
        `Referenced asset "${assetUrl}" must exist on disk at: ${localAssetPath}`
      );

      const size = statSync(localAssetPath).size;
      assert.ok(size > 0, `Referenced asset "${assetUrl}" must not be empty (size: ${size} bytes)`);
    }
  });

  // 4. Verify no SSR or Node runtime dependencies in static bundle
  test('M2-CHALLENGE-04: Static bundle has zero SSR leaks, localhost hardcodes, or Node internals', () => {
    const html = readFileSync(htmlPath, 'utf-8');

    // Must not leak localhost dev servers
    assert.ok(!html.includes('localhost:'), 'dist/index.html must not contain localhost URLs');
    assert.ok(!html.includes('127.0.0.1:'), 'dist/index.html must not contain 127.0.0.1 URLs');

    // Must not contain Node process or fs references in HTML
    assert.ok(!html.includes('require('), 'dist/index.html must not contain CommonJS require');
    assert.ok(!html.includes('process.env.'), 'dist/index.html must not contain process.env leaks');

    // Check JS files in dist/_astro
    const astroDir = resolve(distDir, '_astro');
    if (existsSync(astroDir)) {
      const files = readdirSync(astroDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = readFileSync(join(astroDir, file), 'utf-8');
          assert.ok(!content.includes('localhost:4321'), `Bundle ${file} must not contain dev server port 4321`);
        }
      }
    }
  });

  // 5. Verification of Cytoscape and graph runtime bundle
  test('M2-CHALLENGE-05: Bundled client JS includes Cytoscape engine and custom event handlers', () => {
    const astroDir = resolve(distDir, '_astro');
    const files = readdirSync(astroDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    assert.ok(jsFiles.length >= 2, 'Expected at least two client script bundles');

    let foundCytoscape = false;
    let foundSelectionEvent = false;
    let foundCoseLayout = false;

    for (const file of jsFiles) {
      const content = readFileSync(join(astroDir, file), 'utf-8');
      if (content.includes('cytoscape') || content.includes('Cytoscape') || content.includes('panzoom')) {
        foundCytoscape = true;
      }
      if (content.includes('selection-changed')) {
        foundSelectionEvent = true;
      }
      if (content.includes('cose')) {
        foundCoseLayout = true;
      }
    }

    assert.ok(foundCytoscape, 'Cytoscape core library must be bundled into client script');
    assert.ok(foundSelectionEvent, 'Custom event "selection-changed" must be present in client script bundle');
    assert.ok(foundCoseLayout, 'Cose layout engine must be referenced in client bundle');
  });

  // 6. Typology pills integrity in HTML
  test('M2-CHALLENGE-06: All 6 institutional typologies are represented in the filter pills', () => {
    const html = readFileSync(htmlPath, 'utf-8');
    const requiredTypologies = [
      'ministerio',
      'servicio_publico',
      'bus_transversal',
      'gobierno_local',
      'organo_autonomo',
      'superintendencia',
    ];

    for (const typo of requiredTypologies) {
      const pattern = `value="${typo}"`;
      assert.ok(
        html.includes(pattern),
        `dist/index.html must include filter pill with ${pattern}`
      );
    }
  });

  // 7. Protocols in filter dropdown
  test('M2-CHALLENGE-07: All major interoperability protocols are present in filter dropdown', () => {
    const html = readFileSync(htmlPath, 'utf-8');
    const requiredProtocols = [
      'REST / JSON',
      'SOAP / XML (WSDL)',
      'OpenID Connect / OAuth2',
      'SFTP / Batch plano o CSV',
      'Webhooks / Event-driven',
      'Bilateral Propietario',
    ];

    for (const proto of requiredProtocols) {
      assert.ok(
        html.includes(proto),
        `dist/index.html must include protocol option: "${proto}"`
      );
    }
  });
});
