export class EmailAlreadyUseError extends Error {
  constructor(email: string) {
    super(`This email : ${email} is already in use`);
  }
}
