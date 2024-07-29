const routes = require('./routes');
const CommentsHandler = require('./handler');

module.exports = {
  name: 'comments',
  version: '1.0.0',
  register: async (server, { container, validator }) => {
    const commentsHandler = new CommentsHandler(container, validator);
    server.route(routes(commentsHandler));
  },
};
