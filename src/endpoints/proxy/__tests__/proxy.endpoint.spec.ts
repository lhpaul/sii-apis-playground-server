import { createEndpoint } from '../../../utils/endpoints/endpoints.utils';
import { proxyEndpoint } from '../proxy.endpoint';

jest.mock('./../../../utils/endpoints/endpoints.utils', () => ({
  createEndpoint: jest.fn().mockImplementation(() => ({ test: 'something' }))
}));

describe('proxyEndpoint', () => {
  it('it should be what is returned from createEndpoint', () => {
    const mockValue = { test: 'something' };
    (createEndpoint as jest.Mock).mockReturnValue(mockValue);
    expect(proxyEndpoint).toHaveProperty('test', 'something');
  });
});