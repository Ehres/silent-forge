#!/usr/bin/env ts-node

/**
 * Script de calibration pour les cartes de joueurs
 * Aide à mesurer et ajuster les paramètres de layout des cartes horizontales
 */

import { screen, Region } from '@nut-tree-fork/nut-js';
import { Logger } from './utils/logger';
import { Config, loadConfig } from './config/config';
import { ScreenCapture } from './modules/screen-capture';

const logger = new Logger();

/**
 * Affiche un compte à rebours avant de commencer
 */
async function countdown(seconds: number): Promise<void> {
  for (let i = seconds; i > 0; i--) {
    logger.info(
      `⏰ Calibration des cartes dans ${i} seconde${i > 1 ? 's' : ''}...`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  logger.info('🎯 Capture en cours !');
}

/**
 * Capture une zone autour des cartes de joueurs
 */
async function capturePlayerCardsArea(): Promise<void> {
  try {
    const config = loadConfig();
    const screenCapture = new ScreenCapture();

    // Zone élargie pour capturer plusieurs cartes
    const cardLayout = config.players.cardLayout;
    const captureWidth = (cardLayout.cardWidth + cardLayout.spacing) * 5; // 5 cartes
    const captureHeight = cardLayout.cardHeight + 100; // Hauteur + marge

    const regionCoords = {
      x: cardLayout.startX - 50, // Marge à gauche
      y: cardLayout.startY - 50, // Marge en haut
      width: captureWidth + 100, // Largeur + marges
      height: captureHeight,
    };

    logger.info(
      `📏 Zone de capture: ${regionCoords.x}, ${regionCoords.y}, ${regionCoords.width}x${regionCoords.height}`
    );

    const region = new Region(
      regionCoords.x,
      regionCoords.y,
      regionCoords.width,
      regionCoords.height
    );

    const image = await screen.grabRegion(region);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cards-calibration-${timestamp}`;

    await screenCapture.saveCapture(image, filename);
    logger.info(`💾 Capture sauvegardée: captures/${filename}.png`);

    // Afficher les guides de mesure
    displayMeasurementGuide(cardLayout);
  } catch (error) {
    logger.error(`❌ Erreur lors de la capture: ${error}`);
    throw error;
  }
}

/**
 * Affiche un guide pour mesurer les cartes
 */
function displayMeasurementGuide(cardLayout: Config['players']['cardLayout']): void {
  logger.info('\n📐 GUIDE DE CALIBRATION DES CARTES');
  logger.info('═══════════════════════════════════');
  logger.info('');
  logger.info('Ouvrez le fichier PNG généré et mesurez:');
  logger.info('');
  logger.info('1️⃣  POSITION DE LA PREMIÈRE CARTE:');
  logger.info(
    `   - startX: distance du bord gauche à la première carte (actuellement: ${cardLayout.startX})`
  );
  logger.info(
    `   - startY: distance du bord haut aux cartes (actuellement: ${cardLayout.startY})`
  );
  logger.info('');
  logger.info('2️⃣  DIMENSIONS DES CARTES:');
  logger.info(
    `   - cardWidth: largeur d'une carte (actuellement: ${cardLayout.cardWidth})`
  );
  logger.info(
    `   - cardHeight: hauteur d'une carte (actuellement: ${cardLayout.cardHeight})`
  );
  logger.info('');
  logger.info('3️⃣  ESPACEMENT ENTRE CARTES:');
  logger.info(
    `   - spacing: distance horizontale entre deux cartes (actuellement: ${cardLayout.spacing})`
  );
  logger.info('');
  logger.info('4️⃣  BOUTON "GRANDS MONUMENTS":');
  logger.info(
    `   - monumentsButtonOffset.x: distance depuis le bord gauche de la carte (actuellement: ${cardLayout.monumentsButtonOffset.x})`
  );
  logger.info(
    `   - monumentsButtonOffset.y: distance depuis le bord haut de la carte (actuellement: ${cardLayout.monumentsButtonOffset.y})`
  );
  logger.info(
    `   - monumentsButtonOffset.width: largeur du bouton (actuellement: ${cardLayout.monumentsButtonOffset.width})`
  );
  logger.info(
    `   - monumentsButtonOffset.height: hauteur du bouton (actuellement: ${cardLayout.monumentsButtonOffset.height})`
  );
  logger.info('');
  logger.info(
    '💡 TIP: Le système cliquera automatiquement au centre du bouton avec un léger décalage aléatoire pour simuler un comportement humain.'
  );
  logger.info('');
  logger.info(
    '📝 Pour mettre à jour, modifiez src/config/config.ts > players.cardLayout'
  );
  logger.info('');
}

/**
 * Teste la position calculée pour chaque carte
 */
async function testCardPositions(): Promise<void> {
  try {
    const config = loadConfig();

    logger.info('🎯 TEST DES POSITIONS CALCULÉES');
    logger.info('═══════════════════════════════════');

    for (let i = 0; i < 5; i++) {
      const layout = config.players.cardLayout;
      const cardX = layout.startX + i * (layout.cardWidth + layout.spacing);
      const cardY = layout.startY;
      const buttonX = cardX + layout.monumentsButtonOffset.x;
      const buttonY = cardY + layout.monumentsButtonOffset.y;

      logger.info(`📊 Carte ${i + 1}:`);
      logger.info(`   - Position carte: (${cardX}, ${cardY})`);
      logger.info(`   - Bouton monuments: (${buttonX}, ${buttonY})`);
    }
  } catch (error) {
    logger.error(`❌ Erreur lors du test: ${error}`);
    throw error;
  }
}

/**
 * Menu principal
 */
async function main(): Promise<void> {
  try {
    logger.info('🎯 CALIBRATION DES CARTES DE JOUEURS');
    logger.info('═══════════════════════════════════');
    logger.info('');
    logger.info(
      'Ce script vous aide à calibrer le layout des cartes de joueurs.'
    );
    logger.info("Assurez-vous que la liste des joueurs est visible à l'écran.");
    logger.info('');

    const args = process.argv.slice(2);

    if (args.includes('--test') || args.includes('-t')) {
      await testCardPositions();
      return;
    }

    if (args.includes('--help') || args.includes('-h')) {
      logger.info('Options disponibles:');
      logger.info(
        '  --test, -t    Affiche les positions calculées sans capture'
      );
      logger.info('  --help, -h    Affiche cette aide');
      logger.info('');
      return;
    }

    await countdown(3);
    await capturePlayerCardsArea();
  } catch (error) {
    logger.error(`❌ Erreur fatale: ${error}`);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  main().catch((error) => {
    logger.error(`❌ Erreur non gérée: ${error}`);
    process.exit(1);
  });
}
