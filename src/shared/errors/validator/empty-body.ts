export class EmptyBodyError extends Error {
  constructor() {
    super('The body requisition is empty');
    this.name = 'EmptyBodyError';
  }
}
