/*
 * Created by Arsen Movsesyan on 10/1/17.
 */
import {Component, OnInit} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {InvoiceApplianceModel} from "../../../../../../models/invoice_appliance";
import {ApplianceModel} from "../../../../../../models/appliance";

@Component({
  selector: 'page-invoice-appliance',
  templateUrl: 'invoice_appliance.html'
})
export class InvoiceAppliancePage  implements OnInit {

  private invoiceAppliance: InvoiceApplianceModel;
  private customerAppliance: ApplianceModel;

  constructor(
      private navParams: NavParams,
      private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.invoiceAppliance = this.navParams.get('invoiceAppliance');
    this.customerAppliance = this.navParams.get('customerAppliance');
  }

  onCancel() {
    this.navCtrl.pop().then();
  }
}