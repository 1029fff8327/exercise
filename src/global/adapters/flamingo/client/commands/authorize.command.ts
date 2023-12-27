import { FlamingoMethods, IFlamingoReqCmd } from '../models/service.models';

export class AuthorizeCommand {

  public static build(id: string): IFlamingoReqCmd {
    return {
      method: FlamingoMethods.authorize + id,
    };
  }

}
