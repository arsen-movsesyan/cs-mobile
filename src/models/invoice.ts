/*
 * Created by Arsen Movsesyan on 8/21/17.
 */
import {InvoiceApplianceCreateModel, InvoiceApplianceModel} from './invoice_appliance';

export class InvoiceModel {
  constructor (
    public id: number,
    public labor_type: string,
    public labor_type_readable: string,
    public labor_price: number,
    public tax_percent: string,
    public decimal_tax_percent: number,
    public payment_type: number,
    public invoice_string: string,
    public description: string,
    public map_appliances: InvoiceApplianceModel[],
    public make_void: boolean,
    public created_at: Date,
    public order_status: number
  ) {}
}

export class InvoiceCreateModel {
  constructor (
    public id: number,
    public labor_type: string,
    public labor_price: number,
    public tax_percent: string,
    public decimal_tax_percent: number,
    public payment_type: number,
    public invoice_string: string,
    public description: string,
    public map_appliances: InvoiceApplianceCreateModel[],
    public close_order: boolean,
    public close_reason: string,
    public order_status: number
  ) {}
}
