/*
 * Created by Arsen Movsesyan on 8/4/17.
 */
import {ApplianceTypeModel} from './appliance_type';

export class ReportedApplianceModel {
    constructor(
        public type: ApplianceTypeModel,
        public problem_description: string
    ) {}
}

export class ReportedApplianceCreateModel {
  constructor(
      public type: number,
      public problem_description: string
  ) {}
}