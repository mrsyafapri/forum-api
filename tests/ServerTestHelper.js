/* istanbul ignore file */
const ServerTestHelper = {
  async getAccessTokenAndUserIdHelper({ server }) {
    const userPayload = {
      username:
        Math.random().toString(36).substring(2, 5)
        + Math.random().toString(36).substring(2, 5),
      password: 'supersecretpassword',
    };

    const responseUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'Dicoding Indonesia',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const { id: userId } = JSON.parse(responseUser.payload).data.addedUser;
    const { accessToken } = JSON.parse(responseAuth.payload).data;
    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
