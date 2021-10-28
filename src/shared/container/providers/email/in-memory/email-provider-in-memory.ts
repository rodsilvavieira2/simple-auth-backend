import { IMailProvider } from '../IMail-provider';

export class EmailProviderInMemory implements IMailProvider {
  async verifyMail(email: string): Promise<void> {
    this.verifidedEmails.push(email);
  }
  emails = [];
  verifidedEmails = [];

  async sendMail(
    to: string,
    subject: string,
    variables: any,
    path: string,
  ): Promise<void> {
    this.emails.push({
      to,
      subject,
      variables,
      path,
    });
  }
}
