/*
 * Created by Arsen Movsesyan on 8/4/17.
 */
import {OrganizationModel} from './organization';
import {MailingAddressCreateModel, MailingAddressModel} from './mailing_address';
import {ContactInfoCreateModel, ContactInfoModel} from './contactinfo';
import {ReportedApplianceCreateModel, ReportedApplianceModel} from './reported_appliance';
import {ApplianceFixModel, ApplianceModel} from './appliance';
import {InvoiceModel} from './invoice';

export class CustomerModel {
    constructor(
        public id: number,
        public organization: OrganizationModel,
        public full_name: string,
        public dispatcher_comment: string,
        public order_string: string,
        public order_status: number,
        public email: string,
        public address: MailingAddressModel,
        public contactinfo: ContactInfoModel,
        public reported_appliances: ReportedApplianceModel[],
        public appliances: ApplianceModel[],
        public invoices: InvoiceModel[],
        public current_assigned_start: string,
        public current_assigned_end: string
    ) {}
}

export class CustomerCreateModel {
  constructor(
      public id: number,
      public organization: number,
      public f_name: string,
      public l_name: string,
      public dispatcher_comment: string,
      public email: string,
      public address: MailingAddressCreateModel,
      public contactinfo: ContactInfoCreateModel,
      public reported_appliances: ReportedApplianceCreateModel[]
  ) {}
}

export class CustomerCloseModel {
  constructor(
      public id: number,
      public order_status: number,
      public close_reason: string,
      public make_invisible: boolean,
      public appliances: ApplianceFixModel[]
  ) {}
}