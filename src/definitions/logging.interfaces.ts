import { BaseLogger } from 'pino';

export interface IProcessStep {
  id: string;
  obfuscatedId?: string; // This value is to respond on 500 errors. Check the conventions doc for more info
}

export interface IProcessLogger extends BaseLogger {
  lastStep: IProcessStep;
  initTime: number;
  startStep: (id: string, obfuscatedId?: string) => void;
  endStep: (id: string) => void;
  getStepElapsedTime: (id: string) => number;
  getTotalElapsedTime: () => number;
}