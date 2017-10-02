/*
 * Created by Arsen Movsesyan on 9/30/17.
 */
import {Component, OnInit} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {CustomerModel} from "../../../../../models/customer";
import * as moment from "moment";

@Component({
  selector: 'page-technician-customer-reassign',
  templateUrl: 'reassign.html'
})
export class TechnicianCustomerReassignPage implements OnInit {
  private customer: CustomerModel;
  private assignDatetime: string[];
  private duration: string;

  constructor(
      private navParams: NavParams,
      private viewCtrl: ViewController,
  ) {}

  ngOnInit() {
    this.customer = this.navParams.get('customer');
    this.assignDatetime = this.customer.current_assigned_start.split('T');
    const start = moment.utc(this.customer.current_assigned_start);
    const end = moment.utc(this.customer.current_assigned_end);
    this.duration = moment.utc(end.diff(start)).format('HH:mm');
  }

  onSubmit() {
    this.viewCtrl.dismiss({
      assignStart: moment(this.assignDatetime.join('T')),
      // duration: moment.duration(this.duration),
      assignEnd: moment(this.assignDatetime.join('T')).add(moment.duration(this.duration))
    }).then();
  }

  onCancel() {
    this.viewCtrl.dismiss().then();
  }
}