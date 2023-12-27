export interface IAuthResponse {
  /** Статус код ответа */
  status: number;
  /** Jwt токен для авторизации  */
  access_token: string;
  /** Время жизни токена */
  valid_time: string;
  /** Ссылка для переадресации во внешний сервис */
  login_url: string;
}

export interface IResError {
  /** Название ошибки */
  name: string;
  /** Сообщение об ошибке */
  message: string;
  /** Код ошибки */
  code: number;
  /** Статус код ошибки */
  status: string;
}
