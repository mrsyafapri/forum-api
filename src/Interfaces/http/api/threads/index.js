const ThreadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threads',
  version: '1.0.0',
  register: async (server, { container, validator }) => {
    const threadHandler = new ThreadHandler(container, validator);
    server.route(routes(threadHandler));
  },
};
