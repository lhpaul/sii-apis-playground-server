import { RequestLogger } from '../request-logger.class';
import { Request } from '@hapi/hapi';

describe(RequestLogger.name, () => {
  let mockRequest: Request;
  let logger: RequestLogger;

  beforeEach(() => {
    mockRequest = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    } as unknown as Request;

    logger = new RequestLogger({ request: mockRequest, metadata: { userId: 123 } });
  });

  it('should initialize with correct metadata and initTime', () => {
    expect(logger.metadata).toEqual({ userId: 123 });
    expect(logger.initTime).toBeDefined();
  });

  it('should log info messages', () => {
    logger.info('id', { key: 'value' }, 'Info message');
    expect(mockRequest.logger.info).toHaveBeenCalledWith(
      { id: 'id', data: { key: 'value' }, metadata: { userId: 123 } },
      'Info message'
    );
  });

  it('should log error messages', () => {
    logger.error('id', { error: 'Something went wrong' }, 'Error message');
    expect(mockRequest.logger.error).toHaveBeenCalledWith(
      { id: 'id', data: { error: 'Something went wrong' }, metadata: { userId: 123 } },
      'Error message'
    );
  });

  it('should log warning messages', () => {
    logger.warn('id', { warning: 'This is a warning' }, 'Warning message');
    expect(mockRequest.logger.warn).toHaveBeenCalledWith(
      { id: 'id', data: { warning: 'This is a warning' }, metadata: { userId: 123 } },
      'Warning message'
    );
  });

  it('should log debug messages', () => {
    logger.debug('id', { debug: 'Debugging' }, 'Debug message');
    expect(mockRequest.logger.debug).toHaveBeenCalledWith(
      { id: 'id', data: { debug: 'Debugging' }, metadata: { userId: 123 } },
      'Debug message'
    );
  });

  it('should calculate total elapsed time', () => {
    const elapsedTime = logger.getTotalElapsedTime();
    expect(elapsedTime).toBeGreaterThanOrEqual(0);
  });

  it('should start and end a step with correct logging and also delete the step', () => {
    const stepLabel = 'testStep';
    logger.startStep(stepLabel);

    expect(mockRequest.logger.debug).toHaveBeenCalledWith(
      `step ${stepLabel} started`,
      expect.objectContaining({
        eventName: 'step-start',
        step: stepLabel,
        totalElapsedTime: expect.any(Number),
      })
    );

    logger.endStep(stepLabel);

    expect(mockRequest.logger.debug).toHaveBeenCalledWith(
      expect.stringContaining(`step ${stepLabel} took`),
      expect.objectContaining({
        eventName: 'step-end',
        step: stepLabel,
        elapsedTimeFromPreviousStep: expect.any(Number),
        totalElapsedTime: expect.any(Number),
      })
    );

    expect(logger.getStepElapsedTime(stepLabel)).toBe(-1);
  });

  it('should return -1 for elapsed time of a non-existent step', () => {
    const elapsedTime = logger.getStepElapsedTime('nonExistentStep');
    expect(elapsedTime).toBe(-1);
  });

  it('should calculate elapsed time for an active step', () => {
    const stepLabel = 'activeStep';
    logger.startStep(stepLabel);

    const elapsedTime = logger.getStepElapsedTime(stepLabel);
    expect(elapsedTime).toBeGreaterThanOrEqual(0);
  });

  it('should not log end step if step does not exist', () => {
    logger.endStep('nonExistentStep');
    expect(mockRequest.logger.debug).not.toHaveBeenCalledWith(
      expect.stringContaining('step nonExistentStep took'),
      expect.any(Object)
    );
  });
});