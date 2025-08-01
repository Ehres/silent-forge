#!/usr/bin/env ts-node

import { GameNavigationService } from './modules/game-navigation-service';
import { Logger } from './utils/logger';

/**
 * Script de test avancé pour l'OCR avec parsing de lignes réelles
 */
async function testAdvancedOCRParsing(): Promise<void> {
  const logger = new Logger();
  const gameNavigation = new GameNavigationService();

  logger.info('🧪 Test avancé du parsing OCR des monuments');
  logger.info('='.repeat(60));

  try {
    // Créer une instance pour accéder aux méthodes privées (via réflexion)
    const gameNavigationAny = gameNavigation as any;

    // Tester le parsing avec différents formats de lignes OCR
    const testCases = [
      {
        description: 'Format standard avec investissement personnel',
        ocrLine: 'Tour Eiffel 15 200/800 50 PF rang 3',
        expected: {
          name: 'Tour Eiffel',
          level: 15,
          progression: { current: 200, maximum: 800 },
          myInvestment: 50,
          myRank: 3,
        },
      },
      {
        description: 'Format sans investissement personnel',
        ocrLine: 'Arc de Triomphe 12 450/1000 PF',
        expected: {
          name: 'Arc de Triomphe',
          level: 12,
          progression: { current: 450, maximum: 1000 },
          myInvestment: null,
          myRank: null,
        },
      },
      {
        description: 'Monument avec nom composé',
        ocrLine: 'Statue de la Liberté 8 0/600 PF',
        expected: {
          name: 'Statue de la Liberté',
          level: 8,
          progression: { current: 0, maximum: 600 },
          myInvestment: null,
          myRank: null,
        },
      },
      {
        description: 'Format avec espaces dans la progression',
        ocrLine: 'Notre-Dame de Paris 10 300 / 900 PF',
        expected: {
          name: 'Notre-Dame de Paris',
          level: 10,
          progression: { current: 300, maximum: 900 },
          myInvestment: null,
          myRank: null,
        },
      },
      {
        description: 'Format avec caractères spéciaux',
        ocrLine: 'Château de Versailles 14 |200/750| PF',
        expected: {
          name: 'Château de Versailles',
          level: 14,
          progression: { current: 200, maximum: 750 },
          myInvestment: null,
          myRank: null,
        },
      },
    ];

    logger.info(`📝 Test de ${testCases.length} cas de parsing OCR:`);
    logger.info('');

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      logger.info(`${i + 1}. ${testCase.description}`);
      logger.info(`   Ligne OCR: "${testCase.ocrLine}"`);

      try {
        // Appeler la méthode privée de parsing
        const result = gameNavigationAny.parseMonumentTableRow(
          testCase.ocrLine,
          i
        );

        if (result) {
          // Vérifier les résultats
          const isValid =
            result.name === testCase.expected.name &&
            result.level === testCase.expected.level &&
            result.progression.current ===
              testCase.expected.progression.current &&
            result.progression.maximum ===
              testCase.expected.progression.maximum &&
            result.myInvestment === testCase.expected.myInvestment &&
            result.myRank === testCase.expected.myRank;

          if (isValid) {
            logger.success(
              `   ✅ Parsing réussi: ${result.name} (Niv.${result.level}) - ${result.progression.current}/${result.progression.maximum} PF`
            );
            if (result.myInvestment) {
              logger.info(
                `      💰 Mes investissements: ${result.myInvestment} PF (rang ${result.myRank})`
              );
            }
            successCount++;
          } else {
            logger.error(`   ❌ Parsing incorrect:`);
            logger.error(
              `      Attendu: ${JSON.stringify(testCase.expected, null, 2)}`
            );
            logger.error(`      Obtenu:  ${JSON.stringify(result, null, 2)}`);
            failureCount++;
          }
        } else {
          logger.error(`   ❌ Parsing échoué: aucun résultat retourné`);
          failureCount++;
        }
      } catch (error) {
        logger.error(`   ❌ Erreur de parsing:`, error);
        failureCount++;
      }

      logger.info('');
    }

    // Résumé des résultats
    logger.info('='.repeat(60));
    logger.info('📊 Résumé des tests de parsing:');
    logger.info(`   ✅ Succès: ${successCount}/${testCases.length}`);
    logger.info(`   ❌ Échecs: ${failureCount}/${testCases.length}`);

    if (successCount === testCases.length) {
      logger.success('🎉 Tous les tests de parsing sont passés avec succès!');
    } else {
      logger.warn(
        `⚠️ ${failureCount} test(s) ont échoué - optimisation nécessaire`
      );
    }

    logger.info('');
    logger.info('📋 Prochaines étapes recommandées:');
    logger.info("   1. 📸 Tester avec de vraies captures d'écran du jeu");
    logger.info(
      '   2. 🔧 Ajuster les patterns regex selon les résultats réels'
    );
    logger.info("   3. 🎯 Calibrer les positions des boutons d'action");
    logger.info('   4. ⚡ Optimiser les performances de Tesseract.js');
    logger.info('   5. 🧠 Ajouter la correction automatique des erreurs OCR');
  } catch (error) {
    logger.error('❌ Erreur lors du test avancé:', error);
    process.exit(1);
  }
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testAdvancedOCRParsing().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

export { testAdvancedOCRParsing };
