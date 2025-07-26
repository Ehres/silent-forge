/**
 * Service de logging avec couleurs et niveaux
 */
export class Logger {
  private enableColors: boolean = true;

  constructor(enableColors: boolean = true) {
    this.enableColors = enableColors;
  }

  /**
   * Log d'information général
   */
  info(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.enableColors
      ? `\x1b[36m[INFO]\x1b[0m ${message}`
      : `[INFO] ${message}`;
    console.log(`${timestamp} ${coloredMessage}`, ...args);
  }

  /**
   * Log de succès
   */
  success(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.enableColors
      ? `\x1b[32m[SUCCESS]\x1b[0m ${message}`
      : `[SUCCESS] ${message}`;
    console.log(`${timestamp} ${coloredMessage}`, ...args);
  }

  /**
   * Log d'avertissement
   */
  warn(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.enableColors
      ? `\x1b[33m[WARN]\x1b[0m ${message}`
      : `[WARN] ${message}`;
    console.warn(`${timestamp} ${coloredMessage}`, ...args);
  }

  /**
   * Log d'erreur
   */
  error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.enableColors
      ? `\x1b[31m[ERROR]\x1b[0m ${message}`
      : `[ERROR] ${message}`;
    console.error(`${timestamp} ${coloredMessage}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Log de débogage
   */
  debug(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.enableColors
      ? `\x1b[35m[DEBUG]\x1b[0m ${message}`
      : `[DEBUG] ${message}`;
    console.log(`${timestamp} ${coloredMessage}`, ...args);
  }
}
