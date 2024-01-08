import { HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { IFlamingoError } from '../models/error.model';
import { IResError } from '../models/response.model';


export class FlamingoError extends Error implements IFlamingoError {

  public readonly code: number;
  public readonly message: string;

  constructor(props: IFlamingoError) {
    super(props.message);
    this.code = props.code;
    this.message = props.message;
  }

  public static fromAxios(err: AxiosError): FlamingoError {
    const data: IResError | undefined = err.response?.data as IResError;
    const status = !Number.isNaN(data.status) ? Number(data.status) : err.status;

    return new FlamingoError({
      code: status || HttpStatus.INTERNAL_SERVER_ERROR,
      message: data.message ?? err.message,
    });
  }

  public static fromCatch(err: unknown): FlamingoError {
    const message = err instanceof Error ? err.message : String(err);

    return new FlamingoError({
      code: 500,
      message,
    });
  }

  public static isFlamingoError(err: unknown): err is FlamingoError {
    return err instanceof FlamingoError;
  }

}