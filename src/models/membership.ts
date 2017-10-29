/*
 * Created by Arsen Movsesyan on 9/19/17.
 */
import {TechnicianModel} from './technician';

export class MembershipModel {
  constructor(
      public id: number,
      public nickname: string,
      public color: string,
      public off_start: string,
      public off_end: string,
      public is_admin: boolean,
      public technician: TechnicianModel
  ) {}
}