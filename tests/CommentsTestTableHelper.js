/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    threadId = 'thread-123',
    owner = 'user-123',
    content = 'some comment',
    date = new Date('2024-07-29T00:00:00.000Z'),
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
      values: [id, threadId, owner, content, date],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete=TRUE WHERE id=$1',
      values: [id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
