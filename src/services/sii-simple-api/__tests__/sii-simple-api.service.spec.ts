import { SiiSimpleApiService } from '../sii-simple-api.service';

describe(SiiSimpleApiService.name, () => {
  afterEach(() => {
    // Reset the singleton instance after each test
    (SiiSimpleApiService as any).instance = null;
  });

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