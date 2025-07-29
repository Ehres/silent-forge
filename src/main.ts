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
      let playersToProcess: string[];

      if (playerList && playerList.length > 0) {
        // Utiliser la liste fournie en paramètre
        playersToProcess = playerList;
        this.logger.info(
          `👥 Utilisation de la liste fournie: ${playersToProcess.length} joueur(s)`
        );
      } else if (this.config.players.scanAllPlayers) {
        // Scanner tous les joueurs avec filtrage
        this.logger.info('🔍 Récupération automatique de tous les joueurs...');
        playersToProcess =
          await this.gameNavigationService.getAllPlayersFiltered();
      } else {
        // Mode test avec joueurs par défaut
        playersToProcess = ['TestPlayer1', 'TestPlayer2', 'TestPlayer3'];
        this.logger.info(
          `🧪 Mode test avec ${playersToProcess.length} joueur(s) par défaut`
        );
      }

      this.logger.info(`👥 ${playersToProcess.length} joueur(s) à traiter`);
      this.logger.info('📋 Workflow:');
      this.logger.info('   1. 🔍 Navigation vers chaque joueur');
      this.logger.info('   2. 🏛️ Ouverture des grands monuments');
      this.logger.info(
        '   3. 📊 Identification des monuments avec investissements'
      );
      this.logger.info('   4. 💰 Analyse des opportunités');
      this.logger.info('   5. 🎯 Investissement automatique');
      this.logger.info('');

      // Limitation du nombre de joueurs par session pour la sécurité
      const maxPlayers = this.config.automation.maxPlayersPerSession;
      if (playersToProcess.length > maxPlayers) {
        this.logger.warn(
          `⚠️ Limitation: ${maxPlayers} joueurs max par session`
        );
        playersToProcess.splice(maxPlayers);
      }

      // Traitement de tous les joueurs
      await this.gameNavigationService.processAllPlayers(playersToProcess);

      this.logger.success('🎉 Traitement terminé avec succès!');
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'exécution:", error);
    }
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
  const mode = args[0] || 'normal';

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
      // Mode scan automatique de tous les joueurs
      console.log('🔍 Mode scan automatique activé');
      await silentForge.start(); // Sans paramètres = utilise le scan automatique
      break;

    case 'normal':
    default:
      await silentForge.start();
      break;
  }
}

// Exécution si ce fichier est lancé directement
if (require.main === module) {
  main().catch(console.error);
}

export default SilentForgeMain;
