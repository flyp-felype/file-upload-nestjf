export interface IEmailProvider {
  sendEmail(params: { to: string; subject: string; body: string }): boolean;
}
