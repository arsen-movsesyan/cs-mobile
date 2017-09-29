export class MailingAddressModel {
    constructor(
        public mailing_address: string,
        public address_1: string,
        public route: string,
        public unit_number: string,
        public city: string,
        public state: string,
        public zip_code: string,
        public country: string,
        public lat: string,
        public lng: string
    ) {}
}

export class MailingAddressCreateModel {
  constructor(
      public address_1: string,
      public route: string,
      public unit_number: string,
      public city: string,
      public state: string,
      public zip_code: string,
      public country: string,
      public lat: string,
      public lng: string
  ) {}
}
