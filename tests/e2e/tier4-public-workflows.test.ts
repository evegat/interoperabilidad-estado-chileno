/**
 * Tier 4: Real-World Application Scenarios E2E Tests
 * Validates authentic public administration workflows through the Chilean State interoperability graph.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCanonicalDataset,
  findGraphPath,
  verifyWorkflowSteps,
} from './test-helpers.js';

describe('Tier 4: Real-World Public Workflows End-to-End Tracing', () => {
  const dataset = loadCanonicalDataset();
  const edges = dataset.aristas;

  // --------------------------------------------------------------------------
  // W1: Trámite Social y Asignación de Bonos del Estado (RSH)
  // --------------------------------------------------------------------------
  test('T4.1 - Workflow Bono/Subsidio Social: Ciudadano -> ClaveÚnica -> SRCEI -> MDSF -> TGR', () => {
    // 1. Verify existence of authentic inter-agency steps
    const verification = verifyWorkflowSteps(edges, [
      { from: 'srcei', to: 'claveunica', protocol: 'OpenID Connect / OAuth2' },
      { from: 'srcei', to: 'pisee', protocol: 'SOAP / XML (WSDL)' },
      { from: 'srcei', to: 'mdsf', protocol: 'SOAP / XML (WSDL)' },
      { from: 'sii', to: 'mdsf', protocol: 'SFTP / Batch plano o CSV' },
      { from: 'dipres', to: 'tgr', protocol: 'SFTP / Batch plano o CSV' },
    ]);

    assert.ok(
      verification.success,
      `All steps for Social Subsidies must exist. Missing: ${verification.missingSteps.join(', ')}`
    );

    // 2. Trace path connectivity between Identity provider and Social Registry
    const identityToSocialPath = findGraphPath(edges, 'srcei', 'mdsf', false);
    assert.ok(
      identityToSocialPath !== null && identityToSocialPath.length >= 1,
      'There must be an operational path connecting Civil Registry with Ministry of Social Development'
    );

    // 3. Verify that MDSF links to SII for income verification (crucial for RSH socio-economic qualification)
    const incomeEdge = edges.find(
      (e) => (e.origen === 'sii' && e.destino === 'mdsf') || (e.origen === 'mdsf' && e.destino === 'sii')
    );
    assert.ok(incomeEdge, 'SII to MDSF income cross-referencing flow must be present');
    assert.ok(
      incomeEdge.brecha_observada.includes('informales') || incomeEdge.brecha_observada.includes('RSH'),
      'Diagnosis must document the informal income gap in RSH'
    );
  });

  // --------------------------------------------------------------------------
  // W2: Cadena Transaccional de Compras Públicas (Mercado Público -> SIGFE -> TGR)
  // --------------------------------------------------------------------------
  test('T4.2 - Workflow Compra Pública: ClaveÚnica -> ChileCompra -> SII -> DIPRES -> TGR', () => {
    // Verify direct sequential path from Authentication to Treasury Payment
    const verification = verifyWorkflowSteps(edges, [
      { from: 'claveunica', to: 'chilecompra', bus: 'OpenID Connect Gateway' },
      { from: 'chilecompra', to: 'sii', bus: 'PISEE' },
      { from: 'chilecompra', to: 'dipres', bus: 'SIGFE' },
      { from: 'dipres', to: 'tgr', bus: 'Pago Automático' },
      { from: 'chilecompra', to: 'sociedad_civil', protocol: 'REST / JSON' },
    ]);

    assert.ok(
      verification.success,
      `All steps for Public Procurement chain must exist. Missing: ${verification.missingSteps.join(', ')}`
    );

    // Verify uninterrupted directed path from ClaveÚnica to TGR via ChileCompra & DIPRES
    const cuToChileCompra = edges.find((e) => e.origen === 'claveunica' && e.destino === 'chilecompra');
    const ccToDipres = edges.find((e) => e.origen === 'chilecompra' && e.destino === 'dipres');
    const dipresToTgr = edges.find((e) => e.origen === 'dipres' && e.destino === 'tgr');

    assert.ok(cuToChileCompra, 'Step 1: ClaveÚnica to ChileCompra must exist');
    assert.ok(ccToDipres, 'Step 2: ChileCompra to DIPRES (SIGFE) must exist');
    assert.ok(dipresToTgr, 'Step 3: DIPRES to TGR must exist');

    // Verify legal base citations
    assert.ok(cuToChileCompra.base_legal?.includes('19.886'), 'ChileCompra must cite Compras Públicas law');
    assert.ok(dipresToTgr.base_legal?.includes('1994'), 'DIPRES-TGR must cite organic financial law');
  });

  // --------------------------------------------------------------------------
  // W3: Red de Licencia Médica Electrónica (LME)
  // --------------------------------------------------------------------------
  test('T4.3 - Workflow Salud Pública: Red LME y Registro de Prestadores hacia FONASA', () => {
    const lmeVerification = verifyWorkflowSteps(edges, [
      { from: 'suseso', to: 'fonasa', protocol: 'REST / JSON' },
      { from: 'supersalud', to: 'fonasa', protocol: 'REST / JSON' },
    ]);

    assert.ok(
      lmeVerification.success,
      `Health workflows must be fully registered. Missing: ${lmeVerification.missingSteps.join(', ')}`
    );

    // Verify that FONASA serves as the recipient hub for healthcare entitlements
    const fonasaInEdges = edges.filter((e) => e.destino === 'fonasa');
    assert.ok(fonasaInEdges.length >= 2, 'FONASA must receive data from at least 2 regulatory bodies');

    const susesoEdge = edges.find((e) => e.origen === 'suseso' && e.destino === 'fonasa')!;
    assert.ok(
      susesoEdge.tipo_dato.includes('licencia') || susesoEdge.tipo_dato.includes('médica'),
      'SUSESO edge must transfer Medical License data'
    );
  });

  // --------------------------------------------------------------------------
  // W4: Operación Renta y Retención Automática por Deuda de Alimentos (Ley 21.389)
  // --------------------------------------------------------------------------
  test('T4.4 - Workflow Tributario: Cruce SII + SRCEI en Tesorería TGR para Retención de Alimentos', () => {
    const taxAndAlimony = verifyWorkflowSteps(edges, [
      { from: 'sii', to: 'tgr', bus: 'Fiscalización y Cobranza' },
      { from: 'srcei', to: 'tgr', bus: 'Ley 21.389' },
    ]);

    assert.ok(
      taxAndAlimony.success,
      `Tax & alimony clearing must exist. Missing: ${taxAndAlimony.missingSteps.join(', ')}`
    );

    const alimonyEdge = edges.find((e) => e.origen === 'srcei' && e.destino === 'tgr')!;
    assert.ok(
      alimonyEdge.base_legal?.includes('21.389'),
      'SRCEI-TGR relation must cite Ley 21.389 de Registro de Deudores de Alimentos'
    );
    assert.ok(
      alimonyEdge.brecha_observada.includes('descalce') || alimonyEdge.brecha_observada.includes('temporal'),
      'Must document timing gap between court records and tax refund emissions'
    );
  });

  // --------------------------------------------------------------------------
  // W5: Transformación Digital y Articulación Territorial Local (PISEE + SINIM)
  // --------------------------------------------------------------------------
  test('T4.5 - Workflow Territorial: SGD -> Ministerios (DocDigital) y PISEE -> Municipalidades -> SUBDERE', () => {
    const digitalGov = verifyWorkflowSteps(edges, [
      { from: 'sgd', to: 'ministerios', bus: 'DocDigital' },
      { from: 'pisee', to: 'municipalidades', protocol: 'REST / JSON' },
      { from: 'municipalidades', to: 'subdere', bus: 'SINIM' },
      { from: 'municipalidades', to: 'tgr', bus: 'Fondo Común Municipal' },
    ]);

    assert.ok(
      digitalGov.success,
      `Territorial and digital gov workflows must exist. Missing: ${digitalGov.missingSteps.join(', ')}`
    );

    // Verify Municipal adoption bottleneck documentation
    const municipalPisee = edges.find((e) => e.origen === 'pisee' && e.destino === 'municipalidades')!;
    assert.ok(
      municipalPisee.brecha_observada.includes('20%') || municipalPisee.brecha_observada.includes('municipal'),
      'Must document critical municipal adoption deficit (<20% connected to PISEE)'
    );

    // Verify SINIM reporting gap
    const sinimEdge = edges.find((e) => e.origen === 'municipalidades' && e.destino === 'subdere')!;
    assert.ok(
      sinimEdge.brecha_observada.includes('manual') || sinimEdge.brecha_observada.includes('desfase'),
      'Must document manual reporting friction in municipal SINIM matrices'
    );
  });
});
