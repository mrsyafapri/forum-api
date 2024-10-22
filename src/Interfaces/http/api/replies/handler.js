const autoBind = require('auto-bind');

const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    autoBind(this);
  }

  async postReplyHandler(request, h) {
    this._validator.validateCommentPayload(request.payload);
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const { content } = request.payload;
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const addedReply = await addReplyUseCase.execute({
      content,
      threadId,
      commentId,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );

    const { threadId, commentId, replyId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await deleteReplyUseCase.execute({
      threadId,
      commentId,
      replyId,
      owner: credentialId,
    });

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
