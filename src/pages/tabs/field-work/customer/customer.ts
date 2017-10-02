/*
 * Created by Arsen Movsesyan on 9/22/17.
 */
import {Component,OnInit} from "@angular/core";
import {
  ActionSheet,
  ActionSheetController, AlertController, LoadingController, ModalController,
  NavController,
  NavParams
} from "ionic-angular";

import {CustomerCloseModel, CustomerModel} from "../../../../models/customer";
import {
  ApplianceCreateModel, ApplianceFixModel, ApplianceModel,
  ApplianceUnfixModel
} from "../../../../models/appliance";
import {ContactinfoPage} from "./contactinfo/contactinfo";
import {AddressPage} from "./address/address";
import {DetailsPage} from "./details/details";
import {InvoiceModel} from "../../../../models/invoice";
import {CustomerService} from "../../../../services/customer";
import {EditAppliancePage} from "./edit_appliance/edit_appliance";
import {AppliancePage} from "./appliance/appliance";
import {InvoicePage} from "./invoice/invoice";
import {GenerateInvoicePage} from "./generate_invoice/generate_invoice";
import {CloseReviewPage} from "./close-review/close-review";
import {InstalledPartModel} from "../../../../models/installed_part";
import {RequestedPartModel} from "../../../../models/requested_part";
import {TechnicianCustomerReassignPage} from "./reassign/reassign";

@Component({
  selector: 'page-customer',
  templateUrl: 'customer.html'
})
export class CustomerPage implements OnInit {
  customer: CustomerModel;
  appliances: ApplianceModel[];
  invoices: InvoiceModel[];

  constructor(
      private navParamsCtrl: NavParams,
      private navCtrl: NavController,
      private actionSheetCtrl: ActionSheetController,
      private alertCtrl: AlertController,
      private customerService: CustomerService,
      private loadingCtrl: LoadingController,
      private modalCtrl: ModalController
  ) {
    this.customerService.applianceDeleted
        .subscribe((applianceId: number) => {
            const foundIndex = this.customer.appliances.findIndex((app: ApplianceModel) => {
              return app.id === applianceId;
            });
            this.customer.appliances.splice(foundIndex, 1);
            this._initAppliances();
          });
    this.customerService.applianceUpdated
        .subscribe((appliance: ApplianceModel) => {
            const foundIndex = this.customer.appliances.findIndex((app: ApplianceModel) => {
              return app.id === appliance.id;
            });
            this.customer.appliances[foundIndex] = appliance;
            this._initAppliances();
          });
    this.customerService.invoiceCreated
        .subscribe((invoice: InvoiceModel) => {
              this.customer.invoices.push(invoice);
              this.customer.order_status = invoice.order_status;
              this._initInvoices();
            });
    this.customerService.orderClosed
        .subscribe((closedOrder: CustomerCloseModel) => {
          this.customer.order_status = closedOrder.order_status;
        });
    this.customerService.applianceToggleFixed
        .subscribe((tuple) => {
          for (let a of this.customer.appliances) {
            if (a.id === tuple.applianceId) {
              a.fixed = tuple.fixed;
            }
          }
          this._initAppliances();
        });
    this.customerService.partUninstall
        .subscribe((partData) => {
          this._uninstallPart(partData.partId, partData.applianceId);
          this._initAppliances();
        });
    this.customerService.partRequested
        .subscribe((data) => {
          for (const a of this.customer.appliances) {
            if (a.id === data.id) {
              a.requested_parts.push(data.part);
              break;
            }
          }
          this._initAppliances();
    });
    this.customerService.applianceFixed
        .subscribe((fixedAppliance: ApplianceFixModel) => {
          const foundIndex = this.customer.appliances.findIndex((a:ApplianceModel) => {
            return a.id === fixedAppliance.id;
          });
          this.customer.appliances[foundIndex].installed_parts = fixedAppliance.installed_parts;
          let newRequestedParts: RequestedPartModel[] = [];
          for (let i = 0; i < this.customer.appliances[foundIndex].requested_parts.length; i++) {
            for (let p of fixedAppliance.requested_parts) {
              if (p.id === this.customer.appliances[foundIndex].requested_parts[i].id) {
                newRequestedParts.push(this.customer.appliances[foundIndex].requested_parts[i]);
              }
            }
          }
          this.customer.appliances[foundIndex].requested_parts = newRequestedParts;
          this._initAppliances();
        });
    this.customerService.applianceUnfixed
        .subscribe((unfixedAppliance: ApplianceUnfixModel) => {
          const foundIndex = this.customer.appliances.findIndex((a:ApplianceModel) => {
            return a.id === unfixedAppliance.id;
          });
          let newInstalledParts: InstalledPartModel[] = [];
          for (let i = 0; i < this.customer.appliances[foundIndex].installed_parts.length; i++) {
            for (let p of unfixedAppliance.installed_parts) {
              if (p.id === this.customer.appliances[foundIndex].installed_parts[i].id) {
                newInstalledParts.push(this.customer.appliances[foundIndex].installed_parts[i]);
              }
            }
          }
          this.customer.appliances[foundIndex].installed_parts = newInstalledParts;
          this.customer.appliances[foundIndex].fixed = unfixedAppliance.fixed;
          this._initAppliances();
        });
    this.customerService.invoiceDeleted
        .subscribe((data: {
          customerId: number,
          invoiceId: number
        }) => {
          if (this.customer.id === data.customerId) {
            const foundIndex = this.customer.invoices.findIndex((inv: InvoiceModel) => {
              return inv.id === data.invoiceId;
            });
            // this.customer.invoices.splice(foundIndex, 1);
            this.customer.invoices[foundIndex].make_void = true;
            this._initInvoices()
          }
        });
  }

  ngOnInit() {
    this.customer = this.navParamsCtrl.get('customer');
    this._initAppliances();
    this._initInvoices();

  }

  invoiceAvailable() {
    const foundUnfixed = this.appliances.findIndex((a: ApplianceModel) => {
      return !a.fixed;
    });
    return ((foundUnfixed >= 0) && (this.customer.organization.invoice_enabled));
  }

  onAddressClick() {
    this.navCtrl.push(AddressPage, {
      address: this.customer.address
    }).then();
  }

  onContactLoad() {
    this.navCtrl.push(ContactinfoPage, {
      contactinfo: this.customer.contactinfo
    }).then();
  }

  onDetailLoad() {
    this.navCtrl.push(DetailsPage, {
      customer: this.customer
    }).then();
  }

  onShowOptions() {
    let options: ActionSheet;
    switch (this.customer.order_status) {
      case 1:
        options = this.actionSheetCtrl.create({
          title: 'Choose action',
          buttons: [
            {
              text: 'Add appliance',
              handler: () => {
                this._addNewApplaince();
              }
            },
            {
              text: 'Add/Edit email',
              handler: () => {
                this._addEditEmail();
              }
            },
            {
              text: 'Generate Invoice',
              handler: () => {
                this.onInvoiceGenerate();
              }
            },
            {
              text: 'Close order',
              role: 'destructive',
              handler: () => {
                this.navCtrl.push(CloseReviewPage, {'customer': this.customer}).then();
              }
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]
        });
        break;
      case 4:
        options = this.actionSheetCtrl.create({
          title: 'Choose action',
          buttons: [
            {
              text: 'Reopen',
              role: 'destructive',
              handler: () => {
                const confirmAlert = this.alertCtrl.create({
                  title: 'Are you sure you want to reopen customer?',
                  buttons: [
                    {
                      text: 'No',
                      role: 'cancel'
                    },
                    {
                      text: 'Yes',
                      handler: () => {
                        const load = this.loadingCtrl.create({
                          content: 'Reopening customer...'
                        });
                        load.present().then();
                        this.customerService.reopenCustomer(this.customer.id, true)
                            .subscribe((info) => {
                                this.customer.order_status = info.order_status;
                              },
                                err => {
                          console.log(err);
                          console.log(err.json());
                          const alert = this.alertCtrl.create({
                            title: 'Cannot reopen customer!',
                            message: err.json(),
                            buttons: ['Close']
                          });
                          alert.present().then();
                        });
                      }
                    }
                  ]
                });
                confirmAlert.present().then();
              }
            },
            {
              text: 'Make invisible',
              handler: () => {
                console.log("Make invisible clicked");
              }
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]
        });
        break;
      case 5:
        options = this.actionSheetCtrl.create({
          title: 'Choose action',
          buttons: [
            {
              text: 'Reopen',
              role: 'destructive',
              handler: () => {
                console.log("reopen clicked");
              }
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]
        });
        break;

    }
    options.present().then();
  }

  onNewAppliance() {
    this._addNewApplaince();
  }

  onChooseAppliance(appliance: ApplianceModel) {
    this.navCtrl.push(AppliancePage, {
      appliance: appliance,
      customerId: this.customer.id
    }).then();
  }

  onChooseInvoice(invoice: InvoiceModel) {
    this.navCtrl.push(InvoicePage, {
      invoice: invoice,
      customer: this.customer
    }).then();
  }

  onInvoiceGenerate() {
    if (this.invoiceAvailable()) {
      this.navCtrl.push(GenerateInvoicePage, {
        customer: this.customer
      }).then();
    } else {
      const alert = this.alertCtrl.create({
        title: 'Invoice is not available for this customer',
        buttons: ['Close']
      });
      alert.present().then();
    }
  }

  onReassign() {
    const reassign = this.modalCtrl.create(TechnicianCustomerReassignPage, {
      customer: this.customer
    });
    reassign.present().then();
    reassign.onDidDismiss((reassignedValue) => {
      if (reassignedValue) {
        this.customerService.customerReassign(this.customer.id,
            reassignedValue.assignStart.utc().format(),
            reassignedValue.assignEnd.utc().format()
        )
            .subscribe((newValues) => {
              console.log('Returned')
            });
      }
    });
  }

  private _addEditEmail() {
    const emailAlert = this.alertCtrl.create({
      title: this.customer.email ? 'Edit' : 'Add',
      inputs: [
        {
          name: 'customerEmail',
          value: this.customer.email,
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (newEmail) => {
            const loading = this.loadingCtrl.create({
              content: 'Saving...'
            });
            loading.present().then();
            this.customerService.saveEmail(newEmail.customerEmail, this.customer.id)
                .subscribe(
                    (newEmail: string) => {
                      loading.dismiss().then();
                      this.customer.email = newEmail;
                    },
                    err => {
                      loading.dismiss().then();
                      const alert = this.alertCtrl.create({
                        title: 'Failed to save email!',
                        message: err.json().email,
                        buttons: ['Close']
                      });
                      alert.present().then();
                    }
                );
          }
        }
      ]
    });
    emailAlert.present().then();
  }

  private _addNewApplaince() {
    const newApplianceModal = this.modalCtrl.create(EditAppliancePage, {
      mode: 'add',
      customerId: this.customer.id
    });
    newApplianceModal.present().then();
    newApplianceModal.onDidDismiss((newAppliance: ApplianceCreateModel) => {
      if (newAppliance) {
        const loader = this.loadingCtrl.create({
          content: 'Adding new appliance...'
        });
        loader.present().then();
        this.customerService.addNewAppliance(newAppliance, this.customer.id)
            .subscribe(
                (createdAppliance: ApplianceModel) => {
                  loader.dismiss().then();
                  this.customer.appliances.push(createdAppliance);
                  this._initAppliances();
                },
                err => {
                  loader.dismiss().then();
                  console.log(err.json());
                  const alert = this.alertCtrl.create({
                    title: 'Failed to add new appliance!',
                    message: err.json(),
                    buttons: ['Close']
                  });
                  alert.present().then();
                }
            );
      }
    });
  }

  private _initAppliances() {
    this.appliances = [];
    for (let ap of this.customer.appliances) {
      if (!ap.canceled) {
        this.appliances.push(ap);
      }
    }
  }

  private _initInvoices() {
    this.invoices = [];
    for (let inv of this.customer.invoices) {
      if (!inv.make_void) {
        this.invoices.push(inv);
      }
    }
  }

  private _uninstallPart(uninstalledPartId: number, applianceId: number) {
    for (let a of this.customer.appliances) {
      if (a.id === applianceId) {
        const foundIndex = a.installed_parts.findIndex((installedPart: InstalledPartModel) => {
          return installedPart.id === uninstalledPartId;
        });
        a.installed_parts.splice(foundIndex, 1);
        if (a.fixed) {
          a.fixed = false;
        }
      }
    }
  }
}
