import { BaseLogger } from 'pino';

export interface IProcessLogger extends BaseLogger {
  currentStep: string;
  initTime: number;
  startStep: (id: string) => void;
  endStep: (id: string) => void;
  getStepElapsedTime: (id: string) => number;
  getTotalElapsedTime: () => number;
}