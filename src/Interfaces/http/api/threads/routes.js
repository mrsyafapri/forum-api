const routes = (handler) => [
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: (request, h) => handler.getThreadByIdHandler(request, h),
  },
  {
    method: 'POST',
    path: '/threads',
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
];

module.exports = routes;
