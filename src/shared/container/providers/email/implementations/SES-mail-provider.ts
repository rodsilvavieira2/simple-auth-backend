import { SES } from 'aws-sdk';
import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer, { Transporter } from 'nodemailer';
import { injectable } from 'tsyringe';

import { IMailProvider } from '../IMail-provider';

@injectable()
export class SESMailProvider implements IMailProvider {
  private client: Transporter;
  private SES: SES;

  constructor() {
    this.SES = new SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_REGION,
    });

    this.client = nodemailer.createTransport({
      SES: this.SES,
    });
  }

  async verifyMail(email: string): Promise<void> {
    await this.SES.verifyEmailIdentity({
      EmailAddress: email,
    }).promise();
  }

  async sendMail(
    to: string,
    subject: string,
    variables: any,
    path: string,
  ): Promise<void> {
    const templateFileContent = fs.readFileSync(path).toString('utf-8');

    const templateParser = handlebars.compile(templateFileContent);

    const templateHTML = templateParser(variables);

    await this.client.sendMail({
      to,
      from: 'ecommerce <rodsilvasoul@gmail.com>',
      subject,
      html: templateHTML,
    });
  }
}
