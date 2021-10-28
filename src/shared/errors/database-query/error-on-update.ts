export class ErrorOnUpdate extends Error {
  constructor() {
    super('Error on update the data sent');
    this.name = 'ErrorOnUpdate';
  }
}
