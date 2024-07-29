const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { CommentPayloadSchema } = require('./schema');

const CommentsValidator = {
  validateCommentPayload: (payload) => {
    const validationResult = CommentPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CommentsValidator;
