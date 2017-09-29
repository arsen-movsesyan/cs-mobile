/*
 * Created by Arsen Movsesyan on 8/4/17.
 */
export class ContactInfoModel {
  constructor(
      public phone1: string,
      public phone1_ext: string,
      public phone2: string,
      public phone2_ext: string,
      public phone1_readable: string,
      public phone2_readable: string
  ) {}
}

export class ContactInfoCreateModel {
  constructor(
      public phone1: string,
      public phone1_ext: string,
      public phone2: string,
      public phone2_ext: string
  ) {}
}
