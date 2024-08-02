const pool = require('../../database/postgres/pool');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTestTableHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: {
          content: 'ini komentar',
        },
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

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({
        server,
      });
      const threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'ini komentar',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: '',
        },
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

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        content: 'ini komentar',
      };
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({
        server,
      });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-not-found/comments/${commentId}`,
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

    it('should response 403 when user is not owner', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const userId2 = 'user-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await UsersTableTestHelper.addUser({ id: userId2 });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId2,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
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

    it('should response 200 and delete comment', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
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
