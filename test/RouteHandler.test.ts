import 'isomorphic-fetch';
import { RouteHandler } from '../src/RouteHandler';
import { Task } from '../src/Task';

describe('RouteHandler', () => {

  let routeHandler!: RouteHandler;

  beforeEach(() => {
    routeHandler = new RouteHandler();
  })

  it('should register tasks and execute them', async () => {
    const addMaxAgeHeader = new Task({
      when: ({req}) => {
        return /.*\.(\w{2}|\w{3}|\w{4})$/gm.test(req.url);
      },
      do: async () => {
        return new Response('', { headers: { 'max-age': '120d' } });
      },
      doThen: async () => {
        return new Response('', { headers: { 'max-age': '1d' } });
      },
    });
    routeHandler.registerTask(addMaxAgeHeader).registerTask(new Task({
      do: async ({res}) => {
        return new Response('html', res);
      }
    }));

    const routeRequest = new Request('https://sample.com/users')
    const fileRequest = new Request('https://sample.com/static.json')

    const res1 = await routeHandler.execute({req: routeRequest} as any)
    const res2 = await routeHandler.execute({req: fileRequest} as any)

    expect(await res1.text()).toBe('html');
    expect(res1.headers.get('max-age')).toBe('1d');
    expect(res2.headers.get('max-age')).toBe('120d');
  });

  it('should catch the error', async () => {
    routeHandler.registerTask(new Task({
      do: async () => {
        throw new Error('Execution Error');
      }
    }));
    try {
      await routeHandler.execute({req: new Request('')} as any);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toMatchObject({message: 'Execution Error'});
    }
  });

  // Add more test cases as needed.
});
