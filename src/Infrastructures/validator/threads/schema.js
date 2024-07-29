const Joi = require('joi');

const ThreadPayloadSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
});

module.exports = { ThreadPayloadSchema };
