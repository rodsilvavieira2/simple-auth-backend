export interface IMailProvider {
  sendMail(
    to: string,
    subject: string,
    variables: any,
    path: string,
  ): Promise<void>;

  verifyMail(email: string): Promise<void>;
}
