import { FastifyBaseLogger } from 'fastify';
import { Bindings } from 'pino';
import { ChildLoggerOptions } from 'fastify/types/logger';

import { IProcessLogger } from '../../definitions/logging.interfaces';
import { LOG_IDS } from './request-logger.class.constants';

export class RequestLogger implements IProcessLogger  {

  public initTime: number;
  private _activeSteps: {[labe: string]:{ initTime: number; }} = {};
  private _logger: FastifyBaseLogger;
  private _currentStep: string = '';
  constructor(options: {
    logger: FastifyBaseLogger;
  }) {
    this._logger =  options.logger;
    this.initTime = new Date().getTime();
  }

  get currentStep(): string {
    return this._currentStep;
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

  startStep(label: string): void {
    const now = new Date().getTime();
    this._activeSteps[label] = { initTime: now };
    this._logger.trace(`step ${label} started`, {
      logId: LOG_IDS.STEP_START,
      step: label,
      totalElapsedTime: now - this.initTime,
    });
    this._currentStep = label;
  }

  endStep(label: string): void {
    const step = this._activeSteps[label]
    if (!step) {
      return;
    }
    const now = new Date().getTime();
    const elapsedTimeFromPreviousStep = now - step.initTime;
    this._logger.trace(`step ${label} took ${elapsedTimeFromPreviousStep} ms`, {
      logId: LOG_IDS.STEP_END,
      step: label,
      elapsedTimeFromPreviousStep,
      totalElapsedTime: now - this.initTime
    });
    delete this._activeSteps[label];
  }
}