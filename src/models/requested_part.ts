/*
 * Created by Arsen Movsesyan on 8/4/17.
 */
import {InventoryPartModel} from './inventory_part';

export class RequestedPartModel {

  constructor(
    public id: number,
    public requested_part_number: string,
    public inventory_part: InventoryPartModel
  ) {}
}

export class RequestedPartCloseModel {

  constructor(
      public id: number,
      public requested_part_number: string,
      public inventory_part: number
  ) {}
}

export class UninstallPartModel {
  constructor(
      public id: number,
      public inventory_part: number
  ) {}
}
