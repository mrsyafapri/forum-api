const routes = require('./routes');
const RepliesHandler = require('./handler');

module.exports = {
  name: 'replies',
  version: '1.0.0',
  register: async (server, { container, validator }) => {
    const repliesHandler = new RepliesHandler(container, validator);
    server.route(routes(repliesHandler));
  },
};
