/*
 * Created by Arsen Movsesyan on 9/19/17.
 */
import {ContactInfoModel} from './contactinfo';

export class TechnicianModel {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public first_name: string,
    public last_name: string,
    public contacts: ContactInfoModel
  ) {}
}
