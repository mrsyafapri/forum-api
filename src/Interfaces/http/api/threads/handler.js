const autoBind = require('auto-bind');

const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadByIdUseCase = require('../../../../Applications/use_case/GetThreadByIdUseCase');

class ThreadHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    autoBind(this);
  }

  async postThreadHandler(request, h) {
    this._validator.validateThreadPayload(request.payload);
    const usecasePayload = {
      title: request.payload.title,
      body: request.payload.body,
      owner: request.auth.credentials.id,
    };

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(usecasePayload);

    const response = h.response({
      status: 'success',
      message: 'Thread berhasil ditambahkan',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request) {
    const getThreadByIdUseCase = this._container.getInstance(
      GetThreadByIdUseCase.name,
    );
    const thread = await getThreadByIdUseCase.execute(request.params.threadId);

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }
}

module.exports = ThreadHandler;
