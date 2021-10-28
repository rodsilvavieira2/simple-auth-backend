export class AccessTokenDoesNotExist extends Error {
  constructor() {
    super('This access token does not exist');
  }
}
