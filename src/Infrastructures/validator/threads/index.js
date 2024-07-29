const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { ThreadPayloadSchema } = require('./schema');

const ThreadsValidator = {
  validateThreadPayload: (payload) => {
    const validationResult = ThreadPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ThreadsValidator;
