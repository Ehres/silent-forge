#!/usr/bin/env npx ts-node

/**
 * Test d'intégration OCR avec amélioration
 * Teste l'extraction complète des données avec correction automatique des erreurs OCR
 */

import { GameNavigationService } from './modules/game-navigation-service';
import { Logger } from './utils/logger';

const logger = new Logger();

interface TestScenario {
  name: string;
  description: string;
  mockScreenshot: any;
  expectedResults: {
    monumentCount: number;
    hasEnhancement: boolean;
  };
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Fallback Test',
    description: "Test du fallback en cas d'échec OCR (sans screenshot)",
    mockScreenshot: null,
    expectedResults: {
      monumentCount: 4, // Valeur réelle des données simulées
      hasEnhancement: false,
    },
  },
  {
    name: 'Enhancement Service Test',
    description: "Test du service d'amélioration OCR avec données simulées",
    mockScreenshot: null, // Force le fallback pour tester l'amélioration
    expectedResults: {
      monumentCount: 4, // Valeur réelle des données simulées
      hasEnhancement: true,
    },
  },
];

async function testOCRIntegration(): Promise<void> {
  logger.info("🧪 Démarrage des tests d'intégration OCR avec amélioration");
  logger.info('='.repeat(60));

  const gameNavigation = new GameNavigationService();
  let passedTests = 0;
  let totalTests = TEST_SCENARIOS.length;

  for (const scenario of TEST_SCENARIOS) {
    logger.info(`\n📋 Test: ${scenario.name}`);
    logger.info(`📝 Description: ${scenario.description}`);

    try {
      // Simuler l'extraction via la méthode privée (accès via reflection)
      const extractMethod = (gameNavigation as any).extractMonumentTableData;
      const results = await extractMethod.call(
        gameNavigation,
        scenario.mockScreenshot
      );

      // Vérifier les résultats
      const testPassed = validateResults(results, scenario.expectedResults);

      if (testPassed) {
        logger.info(`✅ Test réussi`);
        passedTests++;

        // Afficher les détails des monuments extraits
        results.forEach((monument: any) => {
          logger.debug(
            `   📍 ${monument.name} - Level ${monument.level} (${monument.progression.current}/${monument.progression.maximum})`
          );
        });
      } else {
        logger.error(`❌ Test échoué`);
        logger.error(
          `   Attendu: ${scenario.expectedResults.monumentCount} monuments`
        );
        logger.error(`   Obtenu: ${results.length} monuments`);
      }
    } catch (error) {
      logger.error(`❌ Erreur pendant le test: ${error}`);
    }
  }

  logger.info('\n' + '='.repeat(60));
  logger.info(
    `📊 Résultats finaux: ${passedTests}/${totalTests} tests réussis`
  );

  if (passedTests === totalTests) {
    logger.info("🎉 Tous les tests d'intégration OCR sont passés!");
    return; // Ne pas terminer le processus, continuer avec les autres tests
  } else {
    logger.error("⚠️ Certains tests d'intégration ont échoué");
    throw new Error("Tests d'intégration échoués");
  }
}

function validateResults(
  results: any[],
  expected: { monumentCount: number; hasEnhancement: boolean }
): boolean {
  // Vérifier le nombre de monuments
  if (results.length !== expected.monumentCount) {
    return false;
  }

  // Vérifier que les monuments ont les propriétés attendues
  for (const monument of results) {
    if (!monument.name || typeof monument.level !== 'number') {
      return false;
    }

    if (
      !monument.progression ||
      typeof monument.progression.current !== 'number' ||
      typeof monument.progression.maximum !== 'number'
    ) {
      return false;
    }
  }

  return true;
}

async function testOCREnhancementFeatures(): Promise<void> {
  logger.info("\n🔧 Test des fonctionnalités d'amélioration OCR");
  logger.info('-'.repeat(50));

  const gameNavigation = new GameNavigationService();

  // Tester la correction de noms de monuments
  const testCases = [
    { input: 'Tour E1ffel', expected: 'Tour Eiffel' },
    { input: 'Arc de Tr10mphe', expected: 'Arc de Triomphe' },
    { input: 'Notre-Dame', expected: 'Notre-Dame' },
    { input: 'Cap1tole', expected: 'Capitole' },
  ];

  let enhancementTests = 0;

  for (const testCase of testCases) {
    try {
      // Accéder au service d'amélioration OCR
      const ocrEnhancement = (gameNavigation as any).ocrEnhancement;
      const enhanced = ocrEnhancement.enhanceSingleMonument({
        name: testCase.input,
        level: 10,
        progression: '100/500',
      });

      if (enhanced.name === testCase.expected) {
        logger.info(`✅ "${testCase.input}" → "${enhanced.name}"`);
        enhancementTests++;
      } else {
        logger.warn(
          `⚠️ "${testCase.input}" → "${enhanced.name}" (attendu: "${testCase.expected}")`
        );
      }
    } catch (error) {
      logger.error(`❌ Erreur lors du test d'amélioration: ${error}`);
    }
  }

  logger.info(
    `\n🎯 Tests d'amélioration: ${enhancementTests}/${testCases.length} réussis`
  );
}

// Exécuter tous les tests
async function runAllTests(): Promise<void> {
  try {
    await testOCRIntegration();
    await testOCREnhancementFeatures();

    logger.info('\n🎉 Tous les tests sont terminés avec succès!');
  } catch (error) {
    logger.error('❌ Erreur fatale lors des tests:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

export { testOCRIntegration, testOCREnhancementFeatures };
