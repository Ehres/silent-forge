#!/usr/bin/env ts-node

import { Image } from '@nut-tree-fork/nut-js';
import Tesseract from 'tesseract.js';
import { ScreenCapture } from './modules/screen-capture';
import { Logger } from './utils/logger';
import { loadConfig } from './config/config';

/**
 * Configuration OCR à tester
 */
interface OCRTestConfig {
  name: string;
  lang: string;
  options: {
    tessedit_char_whitelist: string;
    tessedit_pageseg_mode: number;
    preserve_interword_spaces: string;
  };
}

/**
 * Script de calibrage automatique des paramètres OCR
 */
async function calibrateOCRParameters(): Promise<void> {
  const logger = new Logger();
  const screenCapture = new ScreenCapture();
  const config = loadConfig();

  logger.info('🔧 Calibrage automatique des paramètres OCR');
  logger.info('='.repeat(60));

  try {
    // Configurations OCR à tester
    const testConfigs: OCRTestConfig[] = [
      {
        name: 'Configuration actuelle (Français + Anglais)',
        lang: 'eng+fra',
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -',
          tessedit_pageseg_mode: 6, // PSM.SINGLE_BLOCK
          preserve_interword_spaces: '1',
        },
      },
      {
        name: 'Français uniquement',
        lang: 'fra',
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -',
          tessedit_pageseg_mode: 6,
          preserve_interword_spaces: '1',
        },
      },
      {
        name: 'Mode tableau optimisé',
        lang: 'eng+fra',
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -|',
          tessedit_pageseg_mode: 8, // PSM.SINGLE_WORD
          preserve_interword_spaces: '1',
        },
      },
      {
        name: 'Mode bloc uniforme',
        lang: 'eng+fra',
        options: {
          tessedit_char_whitelist:
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ0123456789/() -',
          tessedit_pageseg_mode: 13, // PSM.RAW_LINE
          preserve_interword_spaces: '1',
        },
      },
    ];

    logger.info('📸 Capture de la zone de test...');
    logger.info('   Position configurée:', {
      x: 520,
      y: 450,
      width: 670,
      height: 315,
    });

    // Attendre que l'utilisateur positionne la fenêtre
    logger.info('📋 Instructions:');
    logger.info('   1. Ouvrez le jeu et naviguez vers la liste des monuments');
    logger.info(
      '   2. Assurez-vous que le tableau des monuments est bien visible'
    );
    logger.info('   3. Appuyez sur Entrée pour commencer le calibrage...');

    await waitForUserInput();

    // Capturer une seule fois
    const screenshot = await screenCapture.captureScreen({
      region: {
        x: 520,
        y: 450,
        width: 670,
        height: 315,
      },
    });

    // Sauvegarder la capture de référence
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await screenCapture.saveCapture(
      screenshot,
      `calibrage_reference_${timestamp}`
    );
    logger.success('✅ Capture de référence sauvegardée');

    logger.info('\n🧪 Test des configurations OCR...');

    const results: Array<{
      config: OCRTestConfig;
      extractedText: string;
      monumentsFound: number;
      processingTime: number;
      confidence: number;
      success: boolean;
    }> = [];

    for (let i = 0; i < testConfigs.length; i++) {
      const testConfig = testConfigs[i];
      logger.info(`\n${i + 1}. Test: ${testConfig.name}`);

      try {
        const startTime = Date.now();

        // Test OCR avec cette configuration (cast needed: nut-js Image → Tesseract ImageLike)
        const ocrResult = await testOCRWithConfig(screenshot as unknown as Tesseract.ImageLike, testConfig);

        const processingTime = Date.now() - startTime;

        // Analyser les résultats
        const monumentsFound = countFoundMonuments(ocrResult.text);
        const confidence = ocrResult.confidence || 0;

        logger.info(`   📝 Texte extrait: ${ocrResult.text.length} caractères`);
        logger.info(`   🏛️ Monuments détectés: ${monumentsFound}`);
        logger.info(`   ⏱️ Temps de traitement: ${processingTime}ms`);
        logger.info(`   🎯 Confiance: ${confidence.toFixed(2)}%`);

        results.push({
          config: testConfig,
          extractedText: ocrResult.text,
          monumentsFound,
          processingTime,
          confidence,
          success: monumentsFound > 0,
        });

        if (monumentsFound > 0) {
          logger.success(`   ✅ Configuration fonctionnelle`);
        } else {
          logger.warn(`   ⚠️ Aucun monument détecté`);
        }
      } catch (error) {
        logger.error(`   ❌ Erreur avec cette configuration:`, error);
        results.push({
          config: testConfig,
          extractedText: '',
          monumentsFound: 0,
          processingTime: 0,
          confidence: 0,
          success: false,
        });
      }
    }

    // Analyser et recommander la meilleure configuration
    logger.info('\n📊 Analyse des résultats:');
    logger.info('='.repeat(60));

    const successfulConfigs = results.filter((r) => r.success);

    if (successfulConfigs.length === 0) {
      logger.error("❌ Aucune configuration n'a fonctionné");
      logger.info('🔧 Recommandations:');
      logger.info('   • Vérifiez la position de capture');
      logger.info('   • Assurez-vous que le texte est bien contrasté');
      logger.info('   • Testez avec une résolution différente');
      logger.info("   • Ajustez l'éclairage de l'écran");
    } else {
      // Trier par nombre de monuments trouvés, puis par confiance
      successfulConfigs.sort((a, b) => {
        if (a.monumentsFound !== b.monumentsFound) {
          return b.monumentsFound - a.monumentsFound;
        }
        return b.confidence - a.confidence;
      });

      const bestConfig = successfulConfigs[0];

      logger.success(`🏆 Meilleure configuration: ${bestConfig.config.name}`);
      logger.info(`   🏛️ Monuments détectés: ${bestConfig.monumentsFound}`);
      logger.info(`   🎯 Confiance: ${bestConfig.confidence.toFixed(2)}%`);
      logger.info(`   ⏱️ Temps: ${bestConfig.processingTime}ms`);

      logger.info('\n🔧 Configuration recommandée:');
      logger.info('```typescript');
      logger.info('const ocrConfig = {');
      logger.info(`  lang: '${bestConfig.config.lang}',`);
      logger.info('  options: {');
      logger.info(
        `    tessedit_char_whitelist: '${bestConfig.config.options.tessedit_char_whitelist}',`
      );
      logger.info(
        `    tessedit_pageseg_mode: ${bestConfig.config.options.tessedit_pageseg_mode},`
      );
      logger.info(
        `    preserve_interword_spaces: '${bestConfig.config.options.preserve_interword_spaces}',`
      );
      logger.info('  },');
      logger.info('};');
      logger.info('```');

      // Sauvegarder le texte extrait de la meilleure configuration
      await saveTextResults(bestConfig, timestamp);
    }
  } catch (error) {
    logger.error('❌ Erreur lors du calibrage:', error);
    process.exit(1);
  }
}

/**
 * Teste l'OCR avec une configuration spécifique
 */
async function testOCRWithConfig(
  screenshot: Tesseract.ImageLike,
  config: OCRTestConfig
): Promise<{ text: string; confidence: number; words: Tesseract.Word[] }> {
  const { createWorker, PSM } = await import('tesseract.js');

  const worker = await createWorker(config.lang);

  // Mapper le mode de segmentation
  let psmMode: Tesseract.PSM;
  switch (config.options.tessedit_pageseg_mode) {
    case 6:
      psmMode = PSM.SINGLE_BLOCK;
      break;
    case 8:
      psmMode = PSM.SINGLE_WORD;
      break;
    case 13:
      psmMode = PSM.RAW_LINE;
      break;
    default:
      psmMode = PSM.SINGLE_BLOCK;
  }

  await worker.setParameters({
    tessedit_char_whitelist: config.options.tessedit_char_whitelist,
    tessedit_pageseg_mode: psmMode,
    preserve_interword_spaces: config.options.preserve_interword_spaces,
  });

  const { data } = await worker.recognize(screenshot);
  await worker.terminate();

  return {
    text: data.text,
    confidence: data.confidence,
    words: data.words,
  };
}

/**
 * Compte le nombre de monuments probables dans le texte
 */
function countFoundMonuments(text: string): number {
  const monumentKeywords = [
    'arc',
    'triomphe',
    'tour',
    'eiffel',
    'statue',
    'liberté',
    'colisée',
    'notre-dame',
    'versailles',
    'château',
    'cathédrale',
    'basilique',
    'monument',
    'temple',
    'pyramide',
    'phare',
    'pont',
  ];

  const lowerText = text.toLowerCase();
  let count = 0;

  // Compter les lignes qui contiennent un ratio X/Y (caractéristique des monuments)
  const progressionMatches = text.match(/\d+\s*\/\s*\d+/g);
  if (progressionMatches) {
    count += progressionMatches.length;
  }

  // Bonus pour les mots-clés de monuments
  monumentKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      count += 0.5;
    }
  });

  return Math.floor(count);
}

/**
 * Sauvegarde les résultats texte de la meilleure configuration
 */
async function saveTextResults(result: { config: OCRTestConfig; extractedText: string; monumentsFound: number; confidence: number; processingTime: number }, timestamp: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const capturesDir = path.join(process.cwd(), 'captures');
  const filename = path.join(capturesDir, `calibrage_results_${timestamp}.txt`);

  const content = [
    `Configuration OCR optimale - ${new Date().toISOString()}`,
    '='.repeat(60),
    `Configuration: ${result.config.name}`,
    `Langue: ${result.config.lang}`,
    `Monuments détectés: ${result.monumentsFound}`,
    `Confiance: ${result.confidence.toFixed(2)}%`,
    `Temps de traitement: ${result.processingTime}ms`,
    '',
    'Texte extrait:',
    '-'.repeat(40),
    result.extractedText,
    '',
    'Configuration technique:',
    '-'.repeat(40),
    JSON.stringify(result.config, null, 2),
  ].join('\n');

  await fs.writeFile(filename, content, 'utf8');
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

// Exécuter le calibrage si appelé directement
if (require.main === module) {
  calibrateOCRParameters().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

export { calibrateOCRParameters };
