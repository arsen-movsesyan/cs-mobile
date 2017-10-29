/*
 * Created by Arsen Movsesyan on 9/12/17.
 */
import {ContactInfoModel} from './contactinfo';
import {OrganizationHeadModel} from './organization';

export class AuthModel {
  constructor(
      public id: number,
      public username: string,
      public email: string,
      public first_name: string,
      public last_name: string,
      public is_staff: boolean,
      public time_zone: string,
      public contacts: ContactInfoModel,
      public organization: OrganizationHeadModel,
      public token: string,
      public is_organization_admin: boolean
  ) {}
}
