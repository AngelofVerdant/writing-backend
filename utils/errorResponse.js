class ErrorResponse extends Error {
  constructor(messages, statusCode) {
    super();
    this.errors = messages;
    this.message = messages;
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;



  