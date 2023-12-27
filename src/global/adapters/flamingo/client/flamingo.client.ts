import axios from 'axios';
import { FlamingoError } from './flamingo.error';
import {
  IFlamingoClientOptions,
  IFlamingoReqCmd,
} from './models/service.models';

export class FlamingoClient {

  private options: IFlamingoClientOptions;

  constructor(options: IFlamingoClientOptions) {
    this.options = options;
  }

  public async write<TRes = string>(props: IFlamingoReqCmd): Promise<TRes> {
    try {
      const response = await axios<TRes>({
        method: 'POST',
        responseType: 'json',
        url: this.options.baseUrl + props.method,
        data: props.data,
        headers: {
          authorization: `Bearer ${this.options.apiKey}`,
        },
      });

      return response.data;
    }
    catch (e) {
      if (axios.isAxiosError(e)) {
        throw FlamingoError.fromAxios(e);
      }
      throw FlamingoError.fromCatch(e);
    }
  }

}
