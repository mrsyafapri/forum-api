const Joi = require('joi');

const CommentPayloadSchema = Joi.object({
  content: Joi.string().required(),
});

module.exports = { CommentPayloadSchema };
