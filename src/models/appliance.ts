/*
 * Created by Arsen Movsesyan on 9/2/17.
 */
import {RequestedPartCloseModel, RequestedPartModel, UninstallPartModel} from './requested_part';
import {ApplianceTypeModel} from './appliance_type';
import {InstalledPartModel} from './installed_part';
import {AppliancePictureModel} from './appliance_picture';

export class ApplianceModel {
  constructor(
    public id: number,
    public type: ApplianceTypeModel,
    public canceled: boolean,
    public fixed: boolean,
    public model_number: string,
    public model_make: string,
    public serial_number: string,
    public problem_description: string,
    public detailed_problem_description: string,
    public requested_parts: RequestedPartModel[],
    public installed_parts: InstalledPartModel[],
    public sticker_image: string,
    public pictures: AppliancePictureModel[]
  ) {}
}

export class ApplianceCreateModel {
  constructor(
    public id: number,
    public type: number,
    public model_number: string,
    public model_make: string,
    public serial_number: string,
    public problem_description: string,
    public detailed_problem_description: string,
  ) {}
}

export class ApplianceFixModel {
  constructor(
      public id: number,
      public requested_parts: RequestedPartCloseModel[],
      public fixed: boolean,
      public installed_parts?: InstalledPartModel[]
  ) {}
}

export class ApplianceUnfixModel {
  constructor(
      public id: number,
      public installed_parts: UninstallPartModel[],
      public message: string,
      public fixed: boolean,
  ) {}
}
