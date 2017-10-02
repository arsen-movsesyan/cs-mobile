/*
 * Created by Arsen Movsesyan on 8/21/17.
 */
import {Component, OnInit} from "@angular/core";
import {ActionSheetController, AlertController, NavController, NavParams, ToastController} from "ionic-angular";
import {InvoiceModel} from "../../../../../models/invoice";
import {CustomerModel} from "../../../../../models/customer";
import {InvoiceAppliancePage} from "./invoice_appliance/invoice_appliance";
import {AuthService} from "../../../../../services/auth";
import {CustomerService} from "../../../../../services/customer";

@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html'
})
export class InvoicePage implements OnInit {
  private invoice: InvoiceModel;
  private customer: CustomerModel;

  constructor(
      private navParamsCtrl: NavParams,
      private actionSheetCtrl: ActionSheetController,
      private navCtrl: NavController,
      private alertCtrl: AlertController,
      private authService: AuthService,
      private customerService: CustomerService,
      private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.invoice = this.navParamsCtrl.get('invoice');
    this.customer = this.navParamsCtrl.get('customer');
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

  onShowOptions() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Choose Action',
      buttons: [
        {
          text: 'Email To Customer',
          handler: () => {
            const emailAlert = this.alertCtrl.create({
              inputs: [
                {
                  name: 'email',
                  value: this.customer.email
                }
              ],
              buttons: [
                {
                  text: 'Send',
                  handler: (email) => {
                    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                    if (re.test(email.email)) {
                      this.customerService.sendInvoiceEmail(this.customer.id, this.invoice.id, email.email)
                          .subscribe(() => {
                            const toast = this.toastCtrl.create({
                              message: 'Email sent successfully',
                              duration: 1500
                            });
                            toast.present().then();
                          });
                    } else {
                      const noEmailAlert = this.alertCtrl.create({
                        title: 'Wrong Email!',
                        message: 'Email format is invalid',
                        buttons: ['Close']
                      });
                      noEmailAlert.present().then();
                    }
                  }
                },
                {
                  text: 'Cancel',
                  role: 'cancel'
                }
              ]
            });
            emailAlert.present().then()
                .catch((err) => {
                  const errAlert = this.alertCtrl.create({
                    title: 'Cannot send email!',
                    message: err.json(),
                    buttons: ['Close']
                  });
                  errAlert.present().then();
                });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    if (this.authService.isAdmin()) {
      actionSheet.addButton({
            text: 'Delete',
            role: 'destructive',
            handler: () => {
              const deleteAlert = this.alertCtrl.create({
                title: 'Are you sure you want to delete this invoice?',
                buttons: [
                  {
                    text: 'No',
                    role: 'cancel'
                  },
                  {
                    text: 'Yes',
                    handler: (unfixAppliances) => {
                      this.customerService.deleteInvoice(this.customer.id, this.invoice.id, unfixAppliances === 'yes')
                          .subscribe(
                        () => {
                          this.navCtrl.pop().then();
                        },
                        err => {
                        console.log(err.json());
                        const failAlet = this.alertCtrl.create({
                          title: 'Faled to delete invoice!',
                          message: err.json(),
                          buttons: ['Close']
                        });
                        failAlet.present().then();
                      });
                    }
                  }
                ]
              });
              if (this.invoice.labor_type === 'labor') {
                deleteAlert.addInput({
                  type: 'checkbox',
                  label: 'Unfix appliances',
                  value: 'yes',
                  checked: true
                });
              }
              deleteAlert.present().then();
            }
          },
      );
    }
    actionSheet.present().then();
  }

  onChooseAppliance(appliance) {
    this.navCtrl.push(InvoiceAppliancePage, {
      invoiceAppliance: appliance,
      customerAppliance: this._getApplianceByMapId(appliance.appliance)
    });
  }

  private _getApplianceByMapId(applianceId: number) {
    for (let a of this.customer.appliances) {
      if (a.id === applianceId) {
        return a;
      }
    }
  }
}