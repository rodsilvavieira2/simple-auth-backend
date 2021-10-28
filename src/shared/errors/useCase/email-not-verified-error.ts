export class EmailNotVerifiedError extends Error {
  constructor(service: string) {
    super(`You must verify your email address to: ${service}`);
    this.name = 'EmailNotVerifiedError';
  }
}
