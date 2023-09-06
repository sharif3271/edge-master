import React from 'react'

export const features = [{
  icon: '🌎',
  title: 'Global Edge Network',
  description: (
    <>
      Unlock the power of a global edge network with EdgeMaster.
    </>
  ),
},
  {
  icon: '🧰',
  title: 'Developer Experience',
  description: (
    <>
      Empowering developers with strong typing and intelligent tooling for seamless TypeScript integration.
    </>
  ),
}, {
  icon: '⚡',
  title: 'Superfast Edge Routing',
  description: (
    <>
      Reducing latency and ensuring rapid responses, delivering unmatched speed and performance to your applications.
    </>
  ),
}]


export const ComponentTestingExample = `
import { RouteHandler, Task } from 'edge-master';


const AuthHandlerTask = new Task({
  when: ({req}) => !!req.headers.get('Authorization'),
  // if when becomes 'true'
  do: async ({req}) => await fetch(req),
  // otherwise if when becomes 'false'
  doThen: async ({req}) => new Response('Unauthorized Request')
});


EdgeApp.addRoute(
  routePattern('*/some/route/*'),
  new RouteHandler().registerTask(AuthHandlerTask)
);
`
