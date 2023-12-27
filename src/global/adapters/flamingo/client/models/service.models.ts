import { UserStatus } from '@unione-pro/unione.commons.nodepack/modules/gway/v4/client';

export interface IFlamingoClientOptions {
  baseUrl: string;
  apiKey: string;
}

export enum FlamingoMethods {
  /** Эндпоинт для передачи данных во внешний сервис */
  webhook = '/assessment/hook',
  /** Эндпоинт для авторизации пользователя во внешнем сервисе. Параметр /:id_auth */
  authorize = '/assessment/auth/',
}

export interface IFlamingoReqCmd {
  method: string;
  data?: unknown;
}

export interface IFlamingoInfo {
  name: string;
  sur_name: string;
  patronymic?: string;
  phone?: string;
  email: string;
  birth?: Date;
  country?: string;
  city?: string;
  photo?: string;
  organization?: IFlamingoOrg;
  role?: UserStatus;
}

export interface IFlamingoEducation {
  id: string;
  organization_id: string;
  institution_name: string;
  duration: number;
  city: string;
  qualification: string;
  graduation_year: string;
}

export interface IFlamingoComp {
  id: string;
  competency_id: string;
  name: string;
  level: number;
  level_desc: string;
  procto_result?: number;
  skill?: string[];
}

export interface IFlamingoUserDoc {
  id: string;
  user_info: IFlamingoInfo;
  extra_education_info: IFlamingoEducation[];
  competency_info: IFlamingoComp[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface IFlamingoOrg {
  id: string;
  name: string;
}
