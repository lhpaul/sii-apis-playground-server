import { Request } from '@hapi/hapi';
import { IProcessLogger } from '../../interfaces/logging.interfaces';

export class RequestLogger implements IProcessLogger {

  public initTime: number;
  public metadata: Record<string, any>;
  private _activeSteps: {[labe: string]:{ initTime: number; }} = {};
  private _request: Request;
  constructor(options: {
    request: Request;
    metadata?: any;
  }) {
    this._request = options.request;
    this.metadata = options.metadata ?? {};
    this.initTime = new Date().getTime();
  }
  
  info(id: string, data: any, message: string): void {
    this._request.logger.info(this._buildLogData(id, data), message);
  }
  error(id: string, data: any, message: string): void {
    this._request.logger.error(this._buildLogData(id, data), message);
  }
  warn(id: string, data: any, message: string): void {
    this._request.logger.warn(this._buildLogData(id, data), message);
  }
  debug(id: string, data: any, message: string): void {
    this._request.logger.debug(this._buildLogData(id, data), message);
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
    this._request.logger.debug(`step ${label} started`, {
      eventName: 'step-start',
      step: label,
      totalElapsedTime: now - this.initTime,
    });
  }

  endStep(label: string): void {
    const step = this._activeSteps[label]
    if (!step) {
      return;
    }
    const now = new Date().getTime();
    const elapsedTimeFromPreviousStep = now - step.initTime;
    this._request.logger.debug(`step ${label} took ${elapsedTimeFromPreviousStep} ms`, {
      eventName: 'step-end',
      step: label,
      elapsedTimeFromPreviousStep,
      totalElapsedTime: now - this.initTime
    });
    delete this._activeSteps[label];
  }

  private _buildLogData(id:string, data: any): any {
    return {
      id,
      data,
      metadata: this.metadata,
    };
  }
}