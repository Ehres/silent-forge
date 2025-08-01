import { GameNavigationService } from './modules/game-navigation-service';
import { Logger } from './utils/logger';
import { loadConfig } from './config/config';

/**
 * Point d'entrée principal de Silent Forge avec workflow complet
 */
class SilentForgeMain {
  private gameNavigationService: GameNavigationService;
  private logger: Logger;
  private config: any;

  constructor() {
    this.logger = new Logger();
    this.config = loadConfig();
    this.gameNavigationService = new GameNavigationService();
  }

  /**
   * Lance l'analyse et l'investissement automatique sur une liste de joueurs
   */
  async start(playerList?: string[]): Promise<void> {
    this.logger.info('🚀 Démarrage de Silent Forge - Workflow complet...');

    try {
      if (playerList && playerList.length > 0) {
        // Mode avec liste prédéfinie
        await this.startWithPlayerList(playerList);
      } else if (this.config.players.scanAllPlayers) {
        // Mode scan automatique avec OCR
        await this.startWithAutoScan();
      } else {
        // Mode séquentiel recommandé (sans OCR des noms)
        await this.startSequentialMode();
      }

      this.logger.success('🎉 Traitement terminé avec succès!');
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'exécution:", error);
    }
  }

  /**
   * Mode avec liste de joueurs prédéfinie
   */
  private async startWithPlayerList(playerList: string[]): Promise<void> {
    this.logger.info(
      `👥 Mode liste prédéfinie: ${playerList.length} joueur(s)`
    );
    this.displayWorkflowInfo();

    // Limitation du nombre de joueurs par session
    const maxPlayers = this.config.automation.maxPlayersPerSession;
    if (playerList.length > maxPlayers) {
      this.logger.warn(`⚠️ Limitation: ${maxPlayers} joueurs max par session`);
      playerList.splice(maxPlayers);
    }

    await this.gameNavigationService.processAllPlayers(playerList);
  }

  /**
   * Mode scan automatique avec OCR des noms
   */
  private async startWithAutoScan(): Promise<void> {
    this.logger.info('� Mode scan automatique avec OCR...');
    const playersToProcess =
      await this.gameNavigationService.getAllPlayersFiltered();
    this.logger.info(`👥 ${playersToProcess.length} joueur(s) récupéré(s)`);

    this.displayWorkflowInfo();

    // Limitation du nombre de joueurs par session
    const maxPlayers = this.config.automation.maxPlayersPerSession;
    if (playersToProcess.length > maxPlayers) {
      this.logger.warn(`⚠️ Limitation: ${maxPlayers} joueurs max par session`);
      playersToProcess.splice(maxPlayers);
    }

    await this.gameNavigationService.processAllPlayers(playersToProcess);
  }

  /**
   * Mode séquentiel recommandé (sans OCR des noms)
   */
  private async startSequentialMode(): Promise<void> {
    this.logger.info('🔄 Mode séquentiel recommandé (sans OCR des noms)...');
    this.logger.info(
      '💡 Plus fiable car ne dépend pas de la reconnaissance des noms'
    );
    this.displayWorkflowInfo();

    await this.showCountdownBeforeStart();

    await this.gameNavigationService.processAllPlayersSequential();
  }

  /**
   * Affiche un countdown avant le démarrage automatique
   */
  private async showCountdownBeforeStart(): Promise<void> {
    const countdownDurationInSeconds = 5;

    this.logger.info('⏰ Démarrage automatique dans:');

    for (let i = countdownDurationInSeconds; i > 0; i--) {
      this.logger.info(`   ${i} seconde${i > 1 ? 's' : ''}...`);
      await this.delay(1000);
    }

    this.logger.info('🚀 Démarrage maintenant!');
    this.logger.info('');
  }

  /**
   * Délai d'attente en millisecondes
   */
  private async delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Affiche les informations du workflow
   */
  private displayWorkflowInfo(): void {
    this.logger.info('📋 Workflow:');
    this.logger.info('   1. 🔍 Navigation vers chaque joueur');
    this.logger.info('   2. �️ Ouverture des grands monuments');
    this.logger.info(
      '   3. 📊 Identification des monuments avec investissements'
    );
    this.logger.info('   4. 💰 Analyse des opportunités');
    this.logger.info('   5. 🎯 Investissement automatique');
    this.logger.info('');
  }

  /**
   * Mode test pour un seul joueur
   */
  async testSinglePlayer(playerName: string): Promise<void> {
    this.logger.info(`🧪 Mode test - Traitement du joueur: ${playerName}`);

    try {
      await this.gameNavigationService.processAllPlayers([playerName]);
      this.logger.success('✅ Test terminé!');
    } catch (error) {
      this.logger.error('❌ Erreur lors du test:', error);
    }
  }

  /**
   * Mode calibration pour vérifier les coordonnées
   */
  async calibrationMode(): Promise<void> {
    this.logger.info(
      '📐 Mode calibration - Vérification des coordonnées UI...'
    );

    // TODO: Implémenter des captures de test pour chaque zone UI
    // - Liste des joueurs
    // - Liste des monuments
    // - Détails d'un monument
    // - Positions des boutons

    this.logger.info('📸 Captures de calibration à implémenter...');
  }
}

// Point d'entrée avec gestion des arguments
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const mode = args[0] || 'sequential';

  const silentForge = new SilentForgeMain();

  switch (mode) {
    case 'test':
      const playerName = args[1] || 'TestPlayer';
      await silentForge.testSinglePlayer(playerName);
      break;

    case 'calibration':
      await silentForge.calibrationMode();
      break;

    case 'players':
      // Mode avec liste de joueurs spécifique
      const customPlayers = args.slice(1);
      await silentForge.start(customPlayers);
      break;

    case 'scan':
      // Mode scan automatique avec OCR
      console.log('🔍 Mode scan automatique avec OCR activé');
      // Forcer le mode scan en modifiant temporairement la config
      const config = silentForge['config'];
      config.players.scanAllPlayers = true;
      await silentForge.start();
      break;

    case 'sequential':
      // Mode séquentiel recommandé (sans OCR des noms)
      console.log('🔄 Mode séquentiel activé (recommandé)');
      await silentForge.start(); // Mode par défaut
      break;

    case 'help':
      console.log('📋 Modes disponibles:');
      console.log(
        '  npm run dev                           # Mode séquentiel (recommandé)'
      );
      console.log(
        '  npm run dev -- sequential             # Mode séquentiel (recommandé)'
      );
      console.log(
        '  npm run dev -- scan                   # Mode scan avec OCR'
      );
      console.log(
        '  npm run dev -- players Joueur1 Joueur2 # Liste spécifique'
      );
      console.log(
        '  npm run dev -- test JoueurTest        # Test un seul joueur'
      );
      console.log('  npm run dev -- calibration            # Mode calibration');
      console.log('  npm run dev -- help                   # Cette aide');
      console.log('');
      console.log('💡 Mode séquentiel recommandé:');
      console.log('  • Plus fiable (pas de dépendance OCR noms)');
      console.log('  • Traite les joueurs par position relative');
      console.log('  • Gestion automatique de la pagination');
      break;

    case 'normal':
    default:
      // Par défaut, utiliser le mode séquentiel
      await silentForge.start();
      break;
  }
}

// Exécution si ce fichier est lancé directement
if (require.main === module) {
  main().catch(console.error);
}

export default SilentForgeMain;
