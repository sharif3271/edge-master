import 'isomorphic-fetch';
import { Task } from '../src/Task';

describe('Task', () => {
  it('should run simple task', async () => {
    const simpleTask = new Task({
      do: async () => {
        return new Response('ok!')
      },
    });
    expect(await (await simpleTask.run({} as any)).text()).toEqual('ok!');
  });

});
