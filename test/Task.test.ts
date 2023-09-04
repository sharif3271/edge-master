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
  it('could transform the input res', async () => {
    const simpleTask = new Task({
      do: async ({ res }) => {
        return new Response(res.body, { status: 400 });
      },
    });
    const transformedRes = (await simpleTask.run({
      res: new Response('ok!', { status: 200 })
    } as any));
    expect(transformedRes.status).toBe(400);
    expect(await transformedRes.text()).toEqual('ok!');
  });
  it('should run a task conditionally', async () => {
    const ConditionTask = new Task({
      do: async () => {
        return new Response('do response', { status: 500 });
      },
      when: ({res}) => {
        return res.status === 400
      }
    });
    const NormalResponse = (await ConditionTask.run({
      res: new Response('ok!', { status: 200 })
    } as any));
    // should be same as input. actually the task do nothing if `when` returns false 
    expect(await NormalResponse.text()).toEqual('ok!');

    const ConditionSatisfiedResponse = (await ConditionTask.run({
      res: new Response('ok!', { status: 400 })
    } as any));
    expect(await ConditionSatisfiedResponse.text()).toEqual('do response');
  });
  it('should run a task with a "doThen" action if "when" condition is not met', async () => {
    const task = new Task({
      do: async () => {
        return new Response('do response');
      },
      doThen: async () => {
        return new Response('doThen response');
      },
      when: ({ res }) => {
        return res.status === 400;
      },
    });
  
    const response = await task.run({
      res: new Response('ok!', { status: 200 }),
    } as any);
  
    expect(await response.text()).toEqual('doThen response');
  });
  it('should handle errors thrown in task actions', async () => {
    const task = new Task({
      do: () => {
        throw new Error('Task action error');
      },
    });
    try {
      await task.run({} as any);
      // The above line should throw an error, so this line should not be reached.
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toMatchObject({message: 'Task action error'});
    }
  });
});
