/*
 * Created by Arsen Movsesyan on 9/22/17.
 */
import {Component} from "@angular/core";
import {OnInit} from "@angular/core";
import {CustomerModel} from "../../../../models/customer";
import {CustomerService} from "../../../../services/customer";
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController} from "ionic-angular";
import {JobRangePage} from "./job-range/job-rage";
import * as moment from "moment";
import {CustomerPage} from "../customer/customer";

@Component({
  selector: 'page-customers-list',
  templateUrl: 'customers-list.html'
})
export class CustomersListPage implements OnInit {
  allCustomers: CustomerModel[] = [];
  customers: CustomerModel[] = [];
  pageTitle: string;

  constructor(
      private navCtrl: NavController,
      private customerService: CustomerService,
      private actionSheetCtrl: ActionSheetController,
      private modalCtrl: ModalController,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this._loadCustomers();
  }

  onShowOptions() {
    const options = this.actionSheetCtrl.create({
      title: 'Choose action',
      buttons: [
        {
          text: 'Reload Customers',
          handler: () => {
            this._loadCustomers(true);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    options.present().then();
  }

  getSearch(ev: any) {
    let val = ev.target.value;
    this._initializeCustomers();
    this.pageTitle = 'Search';
    if (val && val.trim() != '') {
      this.customers = this.customers.filter((item) => {
        return ((item.address.mailing_address.toLowerCase().indexOf(val.toLowerCase()) > -1
            || (item.full_name.toLowerCase().indexOf(val.toLowerCase()) > -1)));
      });
    }
  }

  onChooseRange() {
    const jobRangeModal = this.modalCtrl.create(JobRangePage);
    jobRangeModal.present().then();
    jobRangeModal.onDidDismiss((selectedRange) => {
      if (selectedRange) {
        this.pageTitle = selectedRange.title;
        this._initializeCustomers(selectedRange.begin, selectedRange.end);
      }
    });
  }

  doRefresh(refresher: any) {
    this._loadCustomers(true);
    setTimeout(() => {
      refresher.complete();
    }, 500);
  }

  onSelectCustomer(customer: CustomerModel) {
    this.navCtrl.push(CustomerPage, {
      customer: customer
    }).then();
  }

  private _loadCustomers(refresh=false) {
    const loading = this.loadingCtrl.create({
      content: 'Loading customers...'
    });
    loading.present().then();
    this.customerService.getAllCustomers(refresh)
        .subscribe(
            (customers: CustomerModel[]) => {
              loading.dismiss().then();
              this.allCustomers = customers;
              this._initializeCustomers(moment().startOf('day'), moment().endOf('day'));
              this.pageTitle = 'Today';
              console.log(this.allCustomers);
            },
            err => {
              loading.dismiss().then();
              const alert = this.alertCtrl.create({
                title: 'Failed loading customers!',
                message: err,
                buttons: ['Close']
              });
              alert.present().then();
            }
        );
  }

  private _initializeCustomers(start: moment.Moment = null, end: moment.Moment = null) {
    if (!start) {
      this.customers = this.allCustomers;
    } else {
      this.customers = this.allCustomers.filter((cust: CustomerModel) => {
        let assignStart = moment(cust.current_assigned_start);
        return (assignStart >= start && assignStart <= end);
      });
    }
  }
}
