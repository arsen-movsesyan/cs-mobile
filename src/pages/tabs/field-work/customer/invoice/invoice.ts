/*
 * Created by Arsen Movsesyan on 8/21/17.
 */
import {Component, OnInit} from "@angular/core";
import {NavParams} from "ionic-angular";
import {InvoiceModel} from "../../../../../models/invoice";
import {CustomerModel} from "../../../../../models/customer";

@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html'
})
export class InvoicePage implements OnInit {
  private invoice: InvoiceModel;
  private customer: CustomerModel;

  constructor(
      private navParamsCtrl: NavParams
  ) {}

  ngOnInit() {
    this.invoice = this.navParamsCtrl.get('invoice');
    this.customer = this.navParamsCtrl.get('customer');
    console.log(this.invoice);
  }

  partsPrice() {
    let partsPrice = 0;
    for (let ma of this.invoice.map_appliances) {
      for (let p of ma.parts) {
        partsPrice += +p.invoice_price;
      }
    }
    return partsPrice;
  }

  partsTax() {
    let partsPercent = 0;
    if (this.invoice.decimal_tax_percent !== null) {
      partsPercent = this.invoice.decimal_tax_percent * this.partsPrice() / 100;
    }
    return +partsPercent;
  }

  invoiceTotal() {
    if (this.invoice.labor_type === 'service_fee') {
      return +this.invoice.labor_price;
    }
    return +this.invoice.labor_price + this.partsPrice() + this.partsTax();
  }
}