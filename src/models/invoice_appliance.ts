/*
 * Created by Arsen Movsesyan on 8/21/17.
 */
import {InvoicePartModel} from './invoice_part';

export class InvoiceApplianceModel {
  constructor(
    public id: number,
    public appliance: number,
    public parts: InvoicePartModel[]
  ) {}
}

export class InvoiceApplianceCreateModel {
  constructor(
    public id: number,
    public appliance: number,
    public parts: InvoicePartModel[],
    public leave_unfixed: boolean
  ) {}
}
