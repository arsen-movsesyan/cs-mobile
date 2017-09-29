/*
 * Created by Arsen Movsesyan on 8/4/17.
 */
import {MailingAddressModel} from './mailing_address';
import {ContactInfoModel} from './contactinfo';
import {MembershipModel} from "./membership";

export class OrganizationModel {
  constructor(
        public id: number,
        public organization_name: string,
        public url: string,
        public address: MailingAddressModel,
        public contacts: ContactInfoModel,
        public email: string,
        public license_number: string,
        public settings_sticker_image_mandatory: boolean,
        public settings_tax_included: boolean,
        public settings_default_tax: number,
        public invoice_enabled: boolean,
        public settings_custom_calendar_days: number,
        public settings_default_calendar_agenda: string
  ) {}
}

export class OrganizationHeadModel {
  constructor(
      public id: number,
      public organization_name: string,
      public url: string,
      public address: MailingAddressModel,
      public contacts: ContactInfoModel,
      public email: string,
      public license_number: string,
      public settings_sticker_image_mandatory: boolean,
      public settings_tax_included: boolean,
      public settings_default_tax: number,
      public invoice_enabled: boolean,
      public employees: MembershipModel[],
      public settings_custom_calendar_days: number,
      public settings_default_calendar_agenda: string
  ) {}

}
