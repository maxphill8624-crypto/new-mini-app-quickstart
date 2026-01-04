import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private logFile: string;
  private minLevel: LogLevel;

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'
  };

  constructor(minLevel: LogLevel = 'info', logDir: string = './logs') {
    this.minLevel = minLevel;

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logDir, `bot-${timestamp}.log`);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  private writeToFile(message: string): void {
    fs.appendFileSync(this.logFile, message + '\n');
  }

  private writeToConsole(level: LogLevel, message: string): void {
    const color = this.colors[level];
    const reset = this.colors.reset;
    console.log(`${color}${message}${reset}`);
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatMessage('debug', message, data);
    this.writeToConsole('debug', formatted);
    this.writeToFile(formatted);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage('info', message, data);
    this.writeToConsole('info', formatted);
    this.writeToFile(formatted);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    const formatted = this.formatMessage('warn', message, data);
    this.writeToConsole('warn', formatted);
    this.writeToFile(formatted);
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog('error')) return;
    const formatted = this.formatMessage('error', message, data);
    this.writeToConsole('error', formatted);
    this.writeToFile(formatted);
  }

  trade(trade: any): void {
    const message = `TRADE: ${trade.side} ${trade.size} @ ${trade.price} | Market: ${trade.marketId}`;
    this.info(message, trade);
  }

  signal(signal: any): void {
    const message = `SIGNAL: ${signal.type || 'UNKNOWN'} detected`;
    this.info(message, signal);
  }

  metrics(metrics: any): void {
    this.info('BOT METRICS', metrics);
  }
}
