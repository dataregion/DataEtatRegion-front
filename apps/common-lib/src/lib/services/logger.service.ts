import { Injectable, isDevMode } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface LogCapable {
  debug(message: string, ...args: any[]): void;

  info(message: string, ...args: any[]): void;

  warn(message: string, ...args: any[]): void;

  error(message: string, ...args: any[]): void;
}

@Injectable({ providedIn: 'root' })
export class LoggerService implements LogCapable {

  debug(message: string, ...args: any[]): void {
    this.applicationlogger.debug(message, ...args);
  }
  info(message: string, ...args: any[]): void {
    this.applicationlogger.info(message, ...args);
  }
  warn(message: string, ...args: any[]): void {
    this.applicationlogger.warn(message, ...args);
  }
  error(message: string, ...args: any[]): void {
    this.applicationlogger.error(message, ...args);
  }

  private currentLogLevel: LogLevel;
  private applicationlogger;
  
  constructor() {
    this.currentLogLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.WARN;
    this.applicationlogger = Logger.withName('application');
    this.applicationlogger.setLogLevel(this.currentLogLevel);
  }
  
  getLogger(name: string): LogCapable {
    const logger = Logger.withName(name);
    logger.setLogLevel(this.currentLogLevel);
    return logger;
  }
  
  setLogLevel(level: LogLevel) {
    this.currentLogLevel = level;
    this.applicationlogger.setLogLevel(level);
  }
}

export class Logger implements LogCapable {
  
  static withName(name: string) {
    const logger = new Logger();
    logger.name = name;
    return logger
  }

  private _currentLogLevel: LogLevel = LogLevel.INFO;
  
  private _name = '';
  
  get name(): string {
    return this._name ? `[${this._name}]`: '';
  }
  set name(value: string) {
    this._name = value;
  }

  setLogLevel(level: LogLevel) {
    this._currentLogLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this._currentLogLevel <= LogLevel.DEBUG) {
      console.debug(`${this.name}[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this._currentLogLevel <= LogLevel.INFO) {
      console.info(`${this.name}[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this._currentLogLevel <= LogLevel.WARN) {
      console.warn(`${this.name}[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this._currentLogLevel <= LogLevel.ERROR) {
      console.error(`${this.name}[ERROR] ${message}`, ...args);
    }
  }
}
