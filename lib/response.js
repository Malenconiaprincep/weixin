var errorMsgs = {
  404: 'Not found.',
  500: 'Internal error.'
}

module.exports = function*(view) {
  this.result = this.result || {};
  if (this.json) {
    this.body = this.result
  } else {
    this.locals = this.result
  }
  if (this.locals) {
    console.log(this.locals)
    this.locals.__env = {
      NODE_ENV: process.env.NODE_ENV
    };
    this.status = 200;
    yield this.render(view);
  } else if (this.body === null) {
    this.status = !isNaN(this.status) ? this.status : 500;
    this.body = errorMsgs[this.status];
  } else if (typeof this.body.pipe === 'function') {
    this.status = 200;
  } else {
    this.status = 200;
    this.body.__env = {
      NODE_ENV: process.env.NODE_ENV
    };
  }
}