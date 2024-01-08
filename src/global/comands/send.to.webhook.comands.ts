import { FlamingoMethods, IFlamingoReqCmd, IFlamingoUserDoc } from "../models/service.model";


export class SendToWebhookCommand {

  public static build(props: IFlamingoUserDoc[]): IFlamingoReqCmd {
    return {
      method: FlamingoMethods.webhook,
      data: props,
    };
  }
}