/*
 * Created by Arsen Movsesyan on 9/21/17.
 */

export class ConstantsService {
  private BASE_URL = 'http://192.168.1.10:8080';
  private API_PATH = '/api/v1';

  getBaseApiUrl() {
    return this.BASE_URL + this.API_PATH;
  }

}