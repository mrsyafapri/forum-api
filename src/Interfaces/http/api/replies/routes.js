const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: (request, h) => handler.postReplyHandler(request, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: (request, h) => handler.deleteReplyByIdHandler(request, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
];

module.exports = routes;
