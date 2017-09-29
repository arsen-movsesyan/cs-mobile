/*
 * Created by Arsen Movsesyan on 8/6/17.
 */
import {Component, OnInit} from "@angular/core";
import {NavParams} from "ionic-angular";
import {CustomerModel} from "../../../../../models/customer";

@Component({
    selector: 'page-details',
    templateUrl: 'details.html'
})
export class DetailsPage implements OnInit {
    customer: CustomerModel;

    constructor(
        private navParamsCtrl: NavParams
    ) {}

    ngOnInit() {
        this.customer = this.navParamsCtrl.get('customer');
    }
}