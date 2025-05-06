import { FastifyBaseLogger } from 'fastify';
import { Bindings } from 'pino';
import { ChildLoggerOptions } from 'fastify/types/logger';

import { IProcessLogger, IProcessStep } from '../../definitions/logging.interfaces';
import { LOGS } from './request-logger.class.constants';

export class RequestLogger implements IProcessLogger  {

  public initTime: number;
  private _activeSteps: {[labe: string]:{ initTime: number; }} = {};
  private _logger: FastifyBaseLogger;
  private _lastStep: IProcessStep = { id: '' };
  constructor(options: {
    logger: FastifyBaseLogger;
  }) {
    this._logger =  options.logger;
    this.initTime = new Date().getTime();
  }

  get lastStep(): IProcessStep {
    return this._lastStep;
  }

  get level(): string {
    return this._logger.level;
  }
  
  public info = (data: any, message?: string) => this._logger.info(data, message);
  public error = (data: any, message?: string) => this._logger.error(data, message);
  public warn = (data: any, message?: string) => this._logger.warn(data, message);
  public debug = (data: any, message?: string) => this._logger.debug(data, message);
  public fatal = (data: any, message?: string) => this._logger.fatal(data, message);
  public trace = (data: any, message?: string) => this._logger.trace(data, message);
  public silent = (data: any, message?: string) => this._logger.silent(data, message);
  child(bindings: Bindings, options?: ChildLoggerOptions): FastifyBaseLogger {
    return new RequestLogger({ logger: this._logger.child(bindings, options) });
  }
  getTotalElapsedTime(): number {
    return new Date().getTime() - this.initTime;
  };
  getStepElapsedTime(label: string): number {
    const step = this._activeSteps[label];
    if (!step) {
      return -1;
    }
    return new Date().getTime() - step.initTime;
  }

  startStep(label: string, obfuscatedId?: string): void {
    const now = new Date().getTime();
    this._activeSteps[label] = { initTime: now };
    this._logger.info(LOGS.STEP_START.logMessage(label), {
      logId: LOGS.STEP_START.logId,
      step: label,
      totalElapsedTime: now - this.initTime,
    });
    this._lastStep = { id: label, obfuscatedId };
  }

  endStep(label: string): void {
    const step = this._activeSteps[label]
    if (!step) {
      return;
    }
    const now = new Date().getTime();
    const elapsedTimeFromPreviousStep = now - step.initTime;
    this._logger.info(LOGS.STEP_END.logMessage(label), {
      logId: LOGS.STEP_END.logId,
      step: label,
      elapsedTimeFromPreviousStep,
      totalElapsedTime: now - this.initTime
    });
    delete this._activeSteps[label];
  }
}