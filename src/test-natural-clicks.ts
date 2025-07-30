#!/usr/bin/env ts-node

/**
 * Script de test pour démontrer les clics naturels
 */

import {
  getHumanLikeClickPosition,
  HumanClickSimulator,
  ButtonCoordinates,
  ClickBehavior,
} from './utils/button-utils';
import { Logger } from './utils/logger';

const logger = new Logger();

/**
 * Teste les différents types de comportements de clic
 */
function testClickBehaviors(): void {
  logger.info('🎯 TEST DES COMPORTEMENTS DE CLIC NATURELS');
  logger.info('═══════════════════════════════════════════');

  // Bouton exemple (comme le bouton monuments 20x20)
  const testButton: ButtonCoordinates = {
    x: 359,
    y: 952,
    width: 20,
    height: 20,
  };

  const behaviors: ClickBehavior[] = [
    'precise',
    'casual',
    'hurried',
    'careful',
  ];

  behaviors.forEach((behavior) => {
    logger.info(`\n📊 Comportement "${behavior}":`);

    // Générer 5 positions de test pour chaque comportement
    for (let i = 0; i < 5; i++) {
      const position = getHumanLikeClickPosition(testButton, behavior);
      const relativeX = position.x - testButton.x;
      const relativeY = position.y - testButton.y;

      logger.info(
        `   Test ${i + 1}: (${position.x}, ${position.y}) - relatif (${relativeX}, ${relativeY})`
      );
    }
  });
}

/**
 * Teste le simulateur intelligent avec historique
 */
function testIntelligentSimulator(): void {
  logger.info('\n🧠 TEST DU SIMULATEUR INTELLIGENT');
  logger.info('═══════════════════════════════════');

  const simulator = new HumanClickSimulator();
  const testButton: ButtonCoordinates = {
    x: 359,
    y: 952,
    width: 20,
    height: 20,
  };

  logger.info('\n🔄 Simulation de plusieurs clics rapides:');

  // Simuler plusieurs clics rapides
  for (let i = 0; i < 8; i++) {
    const position = simulator.generateClickPosition(testButton);
    const behavior = simulator.suggestBehavior();
    const relativeX = position.x - testButton.x;
    const relativeY = position.y - testButton.y;

    logger.info(
      `   Clic ${i + 1}: (${position.x}, ${position.y}) - relatif (${relativeX}, ${relativeY}) - comportement: ${behavior}`
    );

    // Petit délai pour simuler des clics rapides
    if (i < 3) {
      // Attendre 100ms (simulation de clics très rapides)
    } else if (i < 6) {
      // Attendre 1s (simulation de clics normaux)
      setTimeout(() => {}, 1000);
    }
    // Derniers clics avec délai plus long
  }

  logger.info('\n💡 Le simulateur adapte automatiquement le comportement :');
  logger.info('   - Premiers clics → comportement "careful" (prudent)');
  logger.info('   - Clics rapides → comportement "hurried" (pressé)');
  logger.info('   - Clics normaux → comportement "casual" (décontracté)');
}

/**
 * Teste la distribution des clics sur un bouton plus grand
 */
function testLargeButtonDistribution(): void {
  logger.info('\n📏 TEST SUR UN BOUTON PLUS GRAND');
  logger.info('═══════════════════════════════════');

  const largeButton: ButtonCoordinates = {
    x: 500,
    y: 300,
    width: 80,
    height: 30,
  };

  logger.info(
    `Bouton: ${largeButton.width}x${largeButton.height} à (${largeButton.x}, ${largeButton.y})`
  );

  const simulator = new HumanClickSimulator();

  logger.info('\n🎲 10 clics avec distribution gaussienne:');

  for (let i = 0; i < 10; i++) {
    const position = simulator.generateClickPosition(largeButton, 'casual');
    const relativeX = position.x - largeButton.x;
    const relativeY = position.y - largeButton.y;
    const centerDistanceX = relativeX - largeButton.width / 2;
    const centerDistanceY = relativeY - largeButton.height / 2;

    logger.info(
      `   Clic ${i + 1}: relatif (${relativeX}, ${relativeY}) - distance du centre (${centerDistanceX.toFixed(1)}, ${centerDistanceY.toFixed(1)})`
    );
  }
}

/**
 * Menu principal
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--behaviors') || args.includes('-b')) {
    testClickBehaviors();
  } else if (args.includes('--intelligent') || args.includes('-i')) {
    testIntelligentSimulator();
  } else if (args.includes('--large') || args.includes('-l')) {
    testLargeButtonDistribution();
  } else if (args.includes('--help') || args.includes('-h')) {
    logger.info('🎯 OPTIONS DISPONIBLES:');
    logger.info(
      '  --behaviors, -b    Teste les différents comportements de clic'
    );
    logger.info(
      '  --intelligent, -i  Teste le simulateur intelligent avec historique'
    );
    logger.info(
      '  --large, -l        Teste la distribution sur un bouton plus grand'
    );
    logger.info('  --help, -h         Affiche cette aide');
    logger.info('');
    logger.info('Par défaut, exécute tous les tests.');
  } else {
    // Exécuter tous les tests
    testClickBehaviors();
    testIntelligentSimulator();
    testLargeButtonDistribution();
  }
}

// Exécution du script
if (require.main === module) {
  main();
}
