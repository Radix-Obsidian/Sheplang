/**
 * LogService
 * Centralized logging for Output panel
 */

export type LogLevel = 'info' | 'success' | 'warning' | 'error';
export type LogChannel = 'sheplang' | 'shepthon' | 'build' | 'system';

export interface LogEntry {
  id: string;
  channel: LogChannel;
  level: LogLevel;
  message: string;
  timestamp: Date;
  details?: any;
}

class LogService {
  private logs: LogEntry[] = [];
  private listeners: Set<(logs: LogEntry[]) => void> = new Set();
  private nextId = 1;

  log(channel: LogChannel, level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      id: String(this.nextId++),
      channel,
      level,
      message,
      timestamp: new Date(),
      details,
    };

    this.logs.push(entry);
    
    // Keep only last 500 logs
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }

    this.notifyListeners();

    // Also console.log for debugging
    const prefix = `[${channel.toUpperCase()}]`;
    const method = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[method](prefix, message, details || '');
  }

  info(channel: LogChannel, message: string, details?: any) {
    this.log(channel, 'info', message, details);
  }

  success(channel: LogChannel, message: string, details?: any) {
    this.log(channel, 'success', message, details);
  }

  warning(channel: LogChannel, message: string, details?: any) {
    this.log(channel, 'warning', message, details);
  }

  error(channel: LogChannel, message: string, details?: any) {
    this.log(channel, 'error', message, details);
  }

  getLogs(channel?: LogChannel): LogEntry[] {
    if (channel) {
      return this.logs.filter(log => log.channel === channel);
    }
    return [...this.logs];
  }

  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  clear(channel?: LogChannel) {
    if (channel) {
      this.logs = this.logs.filter(log => log.channel !== channel);
    } else {
      this.logs = [];
    }
    this.notifyListeners();
  }
}

export const logService = new LogService();

// Initialize with welcome message
logService.success('system', '🐑 ShepYard Alpha initialized');
logService.info('system', 'Ready to build with ShepLang and ShepThon');
