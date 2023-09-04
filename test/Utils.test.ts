import 'isomorphic-fetch';
import fetchMock from "jest-fetch-mock";
import { initResponse, pathStartWith, routePattern, urlStartWith } from '../src/Utils';

describe('Utils & built-in helpers', () => {

  beforeAll(() => {
    fetchMock.enableMocks();
  });
  beforeEach(() => {
    //@ts-ignore
    fetch.resetMocks();
  });

  it('Route matcher tool: pathStartWith', async () => {
    const matcher = pathStartWith('/test');
    const req = new Request('https://example.com/test');
    expect(matcher(req)).toBe(true);
  });
  it('Route matcher tool: urlStartWith', async () => {
    const matcher = urlStartWith('https://origin.com/test');
    const req = new Request('https://origin.com/test/user');
    expect(matcher(req)).toBe(true);
  });
  it('Route matcher tool: routePattern', async () => {
    const matcher = routePattern('*/test/user/*');
    const req = new Request('https://origin.com/test/user/12');
    expect(matcher(req)).toBe(true);
  });
  it('BuiltIn Task: initResponse', async () => {
    //@ts-ignore
    fetch.mockResponseOnce('');
    const InitRequest = initResponse();
    const req = new Request('https://google.com');
    expect((await InitRequest.run({req} as any)).ok).toBe(true);
  });
});
