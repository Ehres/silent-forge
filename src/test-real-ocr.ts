#!/usr/bin/env ts-node

import { GameNavigationService } from './modules/game-navigation-service';
import { ScreenCapture } from './modules/screen-capture';
import { Logger } from './utils/logger';
import { loadConfig } from './config/config';

/**
 * Script de test et calibrage pour l'OCR avec vraies captures d'écran
 */
async function testOCRWithRealCaptures(): Promise<void> {
  const logger = new Logger();
  const screenCapture = new ScreenCapture();
  const gameNavigation = new GameNavigationService();
  const config = loadConfig();

  logger.info("📸 Test OCR avec captures d'écran réelles");
  logger.info('='.repeat(60));

  try {
    // Activer la sauvegarde des captures pour debug
    config.debug.saveCaptures = true;

    logger.info('🎯 Étape 1: Capture de la zone des monuments');
    logger.info('   Position configurée:', {
      x: 520,
      y: 450,
      width: 670,
      height: 315,
    });

    // Attendre que l'utilisateur positionne la fenêtre
    logger.info('📋 Instructions:');
    logger.info('   1. Ouvrez le jeu et naviguez vers la liste des monuments');
    logger.info('   2. Assurez-vous que le tableau des monuments est visible');
    logger.info('   3. Appuyez sur Entrée pour capturer...');

    // Attendre l'input utilisateur
    await waitForUserInput();

    // Capturer la zone des monuments
    const monumentsScreenshot = await screenCapture.captureScreen({
      region: {
        x: 520,
        y: 450,
        width: 670,
        height: 315,
      },
    });

    // Sauvegarder la capture
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test_monuments_capture_${timestamp}`;
    await screenCapture.saveCapture(monumentsScreenshot, filename);

    logger.success(`✅ Capture sauvegardée: ${filename}`);
    logger.info('📁 Vérifiez le fichier dans le dossier captures/');

    logger.info('\n🧠 Étape 2: Test de reconnaissance OCR');

    // Utiliser la méthode privée via réflexion pour tester
    const gameNavigationAny = gameNavigation as any;
    const extractedData =
      await gameNavigationAny.extractMonumentTableData(monumentsScreenshot);

    logger.info(`📊 ${extractedData.length} monument(s) détecté(s):`);

    if (extractedData.length > 0) {
      extractedData.forEach((monument: any, index: number) => {
        logger.info(
          `   ${index + 1}. ${monument.name} (Niv.${monument.level})`
        );
        logger.info(
          `      Progression: ${monument.progression.current}/${monument.progression.maximum} PF`
        );

        if (monument.myInvestment) {
          logger.info(
            `      Mes investissements: ${monument.myInvestment} PF (rang ${monument.myRank})`
          );
        } else {
          logger.info('      Mes investissements: Aucun');
        }

        logger.info(
          `      Bouton: (${monument.activityButtonPosition.x}, ${monument.activityButtonPosition.y})`
        );
        logger.info('');
      });

      // Test du filtrage
      logger.info('🎯 Étape 3: Test du filtrage des monuments cibles');
      const targetMonuments =
        gameNavigationAny.filterTargetMonuments(extractedData);

      logger.info(
        `🏛️ ${targetMonuments.length} monument(s) ciblé(s) (avec investissements mais sans les miens):`
      );
      targetMonuments.forEach((monument: any) => {
        logger.info(
          `   → ${monument.name}: ${monument.progression.current}/${monument.progression.maximum} PF`
        );
      });
    } else {
      logger.warn(
        '⚠️ Aucun monument détecté - vérifiez la position de capture'
      );
    }

    logger.info('\n📋 Étape 4: Recommandations');

    if (extractedData.length === 0) {
      logger.warn('❌ OCR a échoué - Actions recommandées:');
      logger.info('   1. Vérifiez que la zone de capture est correcte');
      logger.info('   2. Assurez-vous que le texte est bien visible');
      logger.info('   3. Ajustez les coordonnées dans la configuration');
      logger.info("   4. Testez avec une résolution d'écran différente");
    } else {
      logger.success('✅ OCR fonctionne - Optimisations possibles:');
      logger.info(
        '   1. Ajustez les patterns regex si certains monuments ne sont pas reconnus'
      );
      logger.info("   2. Calibrez les positions des boutons d'action");
      logger.info(
        '   3. Optimisez les paramètres Tesseract pour améliorer la précision'
      );
      logger.info(
        '   4. Ajoutez une base de noms de monuments connus pour la correction'
      );
    }

    logger.info('\n🔧 Prochaines étapes de développement:');
    logger.info(
      '   • Calibrer les positions des boutons (npm run calibrate-cards)'
    );
    logger.info("   • Tester l'OCR sur différentes pages de joueurs");
    logger.info('   • Implémenter la correction automatique des erreurs OCR');
    logger.info('   • Optimiser les performances de reconnaissance');
  } catch (error) {
    logger.error('❌ Erreur lors du test OCR:', error);
    process.exit(1);
  }
}

/**
 * Attend que l'utilisateur appuie sur Entrée
 */
async function waitForUserInput(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
      const key = chunk.toString();
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      }
    });
  });
}

// Exécuter le test si appelé directement
if (require.main === module) {
  testOCRWithRealCaptures().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

export { testOCRWithRealCaptures };
