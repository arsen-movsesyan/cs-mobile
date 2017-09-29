import {Component} from "@angular/core";
import {OnInit} from "@angular/core";
import {MailingAddressModel} from "../../../../../models/mailing_address";
import {LoadingController, NavParams} from "ionic-angular";
import {Geolocation} from "@ionic-native/geolocation";
import {LatLong} from "../../../../../models/location";

@Component({
    selector: 'page-address',
    templateUrl: 'address.html'
})
export class AddressPage implements OnInit {
    customerAddress: MailingAddressModel;
    addressLocation: LatLong;
    zoom: number = 14;

    constructor(
        private navParamsCtrl: NavParams,
        private geolocation: Geolocation,
        private loadingCtrl: LoadingController
    ) {}

    ngOnInit() {
        this.customerAddress = this.navParamsCtrl.get('address');
        this.addressLocation = new LatLong(
            parseFloat(this.customerAddress.lat),
            parseFloat(this.customerAddress.lng)
        );
    }

    onDirection() {
        const loading = this.loadingCtrl.create({
            content: 'Locaiting'
        });
        loading.present();
        this.geolocation.getCurrentPosition()
            .then(
                location => {
                    loading.dismiss();
                }
            )
            .catch(
                (error) => {
                    loading.dismiss();
                    console.log(error);
                }
            );

    }
}