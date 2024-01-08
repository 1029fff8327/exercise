import { ISendMailProps } from "../models/mail.models"; 

export class MailMapper {
  public static buildMailPayload(props: ISendMailProps): ISendMailProps {
    return {
      from: props.from,
      text: props.text,
      to: props.to,
      subject: props.subject,
    };
  }
}
