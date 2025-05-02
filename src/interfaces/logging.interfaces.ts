export interface ILogger {
  info: (id: string, data: any, message: string) => void;
  error: (id: string, data: any, message: string) => void;
  warn: (id: string, data: any, message: string) => void;
  debug: (id: string, data: any, message: string) => void;
}

export interface IProcessLogger extends ILogger {
  initTime: number;
  metadata: Record<string, any>;
  startStep: (id: string) => void;
  endStep: (id: string) => void;
  getStepElapsedTime: (id: string) => number;
  getTotalElapsedTime: () => number;
}