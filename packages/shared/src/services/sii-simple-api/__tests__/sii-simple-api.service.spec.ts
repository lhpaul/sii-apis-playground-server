import { ExecutionLogger } from '../../../definitions';
import { ProxyService } from '../../proxy';
import { SiiSimpleApiService } from '../sii-simple-api.service';
import { MASK_OPTIONS } from '../sii-simple-api.service.constants';

describe(SiiSimpleApiService.name, () => {

  const mockLogger = {
    lastStep: { id: '1' },
    stepsCounter: 0,
    initTime: 0,
    startStep: jest.fn(),
    endStep: jest.fn(),
  } as unknown as ExecutionLogger;
  afterEach(() => {
    // Reset the singleton instance after each test
    (SiiSimpleApiService as any).instance = null;
  });

  describe(SiiSimpleApiService.getInstance.name, () => {
    it('should create an instance of SiiSimpleApiService', () => {
      const service = SiiSimpleApiService.getInstance();
      expect(service).toBeInstanceOf(SiiSimpleApiService);
    });
  
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = SiiSimpleApiService.getInstance();
      const instance2 = SiiSimpleApiService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(SiiSimpleApiService.prototype.makeRequest.name, () => {
    it('should call the parent makeRequest method with merged maskOptions', async () => {
      const mockMakeRequest = jest.fn();
      (ProxyService.prototype.makeRequest as jest.Mock) = mockMakeRequest;

      const service = SiiSimpleApiService.getInstance();
      const values = { method: 'GET', path: '/test' };
      const options = { maskOptions: { requestHeaders: ['authorization'] } };

      await service.makeRequest(values, mockLogger, options);

      expect(mockMakeRequest).toHaveBeenCalledWith(values, mockLogger, {
        ...options,
        maskOptions: {
          ...options.maskOptions,
          ...MASK_OPTIONS,
        },
      });
    });

    it('should call the parent makeRequest method with default maskOptions if none are provided', async () => {
      const mockMakeRequest = jest.fn();
      (ProxyService.prototype.makeRequest as jest.Mock) = mockMakeRequest;

      const service = SiiSimpleApiService.getInstance();
      const values = { method: 'POST', path: '/test', payload: { key: 'value' } };

      await service.makeRequest(values, mockLogger);

      expect(mockMakeRequest).toHaveBeenCalledWith(values, mockLogger, {
        maskOptions: MASK_OPTIONS,
      });
    });

    it('should handle cases where options are undefined', async () => {
      const mockMakeRequest = jest.fn();
      (ProxyService.prototype.makeRequest as jest.Mock) = mockMakeRequest;

      const service = SiiSimpleApiService.getInstance();
      const values = { method: 'DELETE', path: '/test' };

      await service.makeRequest(values, mockLogger);

      expect(mockMakeRequest).toHaveBeenCalledWith(values, mockLogger, {
        maskOptions: MASK_OPTIONS,
      });
    });
  });
});