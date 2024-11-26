class PaymentRegistry {
  constructor() {
    this.methods = {};
  }

  addMethod(name, method) {
    this.methods[name] = method;
  }

  getMethod(name) {
    return this.methods[name];
  }

  listMethods() {
    return Object.keys(this.methods);
  }
}

module.exports = new PaymentRegistry();
