import {Component, OnInit} from "@angular/core";
import {NavParams} from "ionic-angular";
import {ContactInfoModel} from "../../../../../models/contactinfo";
import {CallNumber} from "@ionic-native/call-number";

@Component({
    selector: 'page-contactinfo',
    templateUrl: 'contactinfo.html'
})
export class ContactinfoPage implements OnInit {
    contactinfo: ContactInfoModel;
    phone1: string;
    phone2: string;

    constructor(
        private navParamsCtrl: NavParams,
        private callNumberCtrl: CallNumber
    ) {}

    ngOnInit() {
        this.contactinfo = this.navParamsCtrl.get('contactinfo');
        this.phone1 = ContactinfoPage._formatPhone(this.contactinfo.phone1, this.contactinfo.phone1_ext);
        if (this.contactinfo.phone2) {
            this.phone1 = ContactinfoPage._formatPhone(this.contactinfo.phone2, this.contactinfo.phone2_ext);
        }
    }

    onCallNumber(which: number) {
        switch (which) {
            case 1:
                this.callNumberCtrl.callNumber(this.contactinfo.phone1, true);
                break;
            case 2:
                this.callNumberCtrl.callNumber(this.contactinfo.phone2, true);
                break;
        }
    }

    private static _formatPhone(phone, ext) {
        let num = '(' + phone.substr(0, 3) + ') ' + phone.substr(3, 3) + '-' + phone.substr(6);
        if (ext) {
            num += ' ext ' + ext;
        }
        return num;
    }
}
