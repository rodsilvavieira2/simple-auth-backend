export class EmailOrPasswordInvalid extends Error {
  constructor() {
    super('Email or password invalid');
    this.name = 'EmailOrPasswordInvalid';
  }
}
