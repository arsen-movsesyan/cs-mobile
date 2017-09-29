import {Component, OnInit} from "@angular/core";
import { NavParams, ViewController} from "ionic-angular";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Storage} from "@ionic/storage";
import {ApplianceCreateModel, ApplianceModel} from "../../../../../models/appliance";
import {ApplianceTypeModel} from "../../../../../models/appliance_type";

@Component({
    selector: 'edit-appliance-page',
    templateUrl: 'edit_appliance.html'
})
export class EditAppliancePage implements OnInit {
    appliance: ApplianceModel;
    applianceTypes: ApplianceTypeModel[];
    mode: string;
    applianceForm: FormGroup;

    constructor(
        private navParamsCtrl: NavParams,
        private storage: Storage,
        private viewCtrl: ViewController
    ) {}

    ngOnInit() {
        this.mode = this.navParamsCtrl.get('mode');
        this.storage.get('applianceTypes')
            .then(
                (data) => {
                    this.applianceTypes = data;
                }
            );
        if (this.mode === 'update') {
            this.appliance = this.navParamsCtrl.get('appliance');
        }
        this._initializeForm();
    }

    onSubmit() {
        const v = this.applianceForm.value;
        this.applianceForm.reset();
        const ret = new ApplianceCreateModel(
            v.id, v.type, v.model_number, v.model_make, v.serial_number,
            v.problem_description, v.detailed_problem_description
        );
        this.viewCtrl.dismiss(ret);
    }

    onCancel() {
        this.viewCtrl.dismiss();
    }

    private _initializeForm() {
        this.applianceForm = new FormGroup({
            id: new FormControl(this.appliance ? this.appliance.id: null),
            type: new FormControl(this.appliance ? this.appliance.type.id : null, Validators.required),
            model_make: new FormControl(this.appliance ? this.appliance.model_make : null, Validators.required),
            model_number: new FormControl(this.appliance ? this.appliance.model_number: null, Validators.required),
            serial_number: new FormControl(this.appliance ? this.appliance.serial_number : null),
            problem_description: new FormControl(this.appliance ? this.appliance.problem_description : null, Validators.required),
            detailed_problem_description: new FormControl(this.appliance ? this.appliance.detailed_problem_description : null)
        });
    }
}