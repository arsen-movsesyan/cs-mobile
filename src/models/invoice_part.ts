/*
 * Created by Arsen Movsesyan on 8/21/17.
 */
export class InvoicePartModel {
    constructor(
        public part: number,
        public installed_part_number: string,
        public invoice_price: number
    ) {}
}
