const autoBind = require('auto-bind');

const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    autoBind(this);
  }

  async postCommentHandler(request, h) {
    this._validator.validateCommentPayload(request.payload);
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );
    const addedComment = await addCommentUseCase.execute({
      content: request.payload.content,
      threadId: request.params.threadId,
      owner: request.auth.credentials.id,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const useCasePayload = {
      commentId: request.params.commentId,
      threadId: request.params.threadId,
      owner: request.auth.credentials.id,
    };

    const deleteComment = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    await deleteComment.execute(useCasePayload);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
