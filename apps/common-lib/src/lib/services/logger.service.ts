import { Injectable, isDevMode } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}
/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private currentLogLevel: LogLevel = isDevMode() ? LogLevel.DEBUG : LogLevel.WARN;

  setLogLevel(level: LogLevel) {
    this.currentLogLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}
