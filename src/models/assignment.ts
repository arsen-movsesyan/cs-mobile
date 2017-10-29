/*
 * Created by Arsen Movsesyan on 10/5/17.
 */
export class AssignmentModel {
  constructor(
      public id: number,
      public technician: number,
      public special_remark: string,
      public assign_start: string,
      public assign_end: string,
      public is_active: boolean,
      public deactivated_at: string
  ) {}
}