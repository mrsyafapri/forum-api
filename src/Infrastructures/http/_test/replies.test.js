const pool = require('../../database/postgres/pool');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini balasan',
      };
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini balasan',
      };
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini balasan',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/xxxxx/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Komentar pada thread ini tidak ditemukan',
      );
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        content: '',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        '"content" is not allowed to be empty',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('"content" must be a string');
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini balasan',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-xxx';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-xxx';
      const replyId = 'reply-123';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-xxx';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 401 when user not owner', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const userId2 = 'user-345';
      await UsersTableTestHelper.addUser({ id: userId2 });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId2,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId2,
        commentId: 'comment-123',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Anda tidak berhak mengakses resource ini',
      );
    });

    it('should response 200 when delete reply', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        commentId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
