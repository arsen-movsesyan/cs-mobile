/*
 * Created by Arsen Movsesyan on 9/26/17.
 */
import {Component, OnInit} from "@angular/core";
import {CustomerCloseModel, CustomerModel} from "../../../../../models/customer";
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ApplianceFixModel, ApplianceModel} from "../../../../../models/appliance";
import {RequestedPartCloseModel} from "../../../../../models/requested_part";
import {AlertController, LoadingController, ModalController, NavController, NavParams} from "ionic-angular";
import {CloseAppliancePartsPage} from "./close_appliance_parts/close_appliance_parts";
import {CustomerService} from "../../../../../services/customer";

@Component({
  selector: 'page-close-review',
  templateUrl: 'close-review.html'
})
export class CloseReviewPage implements OnInit {
  private customer: CustomerModel;
  private reviewForm: FormGroup;
  private includedAppliances: {
    appliance: ApplianceModel,
    includedParts: {
      part: RequestedPartCloseModel,
      toggle: FormControl
    }[]
  }[] = [];

  constructor(
      private navParams: NavParams,
      private formBuilder: FormBuilder,
      private modalCtrl: ModalController,
      private navCtrl: NavController,
      private customerService: CustomerService,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.customer = this.navParams.get('customer');
    this.reviewForm = this.formBuilder.group({
      closeReason: 'Closed Explicitly',
      makeInvisible: false,
      appliances: this.formBuilder.array([])
    });
    const reviewFormAppliances = this.reviewForm.controls['appliances'] as FormArray;
    for (const a of this.customer.appliances) {
      if ((!a.fixed) && (!a.canceled)) {
        const applianceFormGroup = this.formBuilder.group({
          applianceId: a.id,
          requestedParts: this.formBuilder.array([])
        });
        const suplimentalObject = {
          appliance: a,
          includedParts: []
        };
        for (const p of a.requested_parts) {
          if (p.inventory_part.part_status === 3) {
            const partsArrayForm = applianceFormGroup.controls['requestedParts'] as FormArray;
            partsArrayForm.push(this.formBuilder.group({
              id: p.id,
              partId: p.inventory_part.id,
              partNumber: p.requested_part_number
            }));
            suplimentalObject.includedParts.push({
              part: p,
              toggle: this.formBuilder.control(true)
            });
          }
        }
        this.includedAppliances.push(suplimentalObject);
        reviewFormAppliances.push(applianceFormGroup);
      }
    }
  }

  onSelectAppliance(index: number) {
    let applianceWithParts = this.includedAppliances[index].appliance;
    let applianceFormGroup = this._getApplianceGroupById(applianceWithParts.id);
    const applianceParts = this.modalCtrl.create(CloseAppliancePartsPage, {
      partsFormGroup: applianceFormGroup,
      includedApplianceObject: this.includedAppliances[index]
    });
    applianceParts.present().then();
    applianceParts.onDidDismiss((formGroup) => {
      if (formGroup) {
        applianceFormGroup = formGroup;
      }
    });
  }

  onOrderClose() {
    const loading = this.loadingCtrl.create({
      content: 'Closing Customer...'
    });
    loading.present().then();
    this.customerService.closeOrder(this._buildCloseCustomerModel())
        .subscribe((closedOrder: CustomerCloseModel) => {
      loading.dismiss().then();
      this.reviewForm.reset();
      this.navCtrl.pop().then();
    },
        err => {
      loading.dismiss().then();
      console.log(err);
      console.log(err.json());
      const alert = this.alertCtrl.create({
        title: 'Cannot close customer!',
        message: err.json(),
        buttons: ['Close']
      });
      alert.present().then();
    });
  }

  private _getApplianceGroupById(applianceId: number) {
    const invoiceMapForm = this.reviewForm.controls['appliances'] as FormArray;
    const foundIndex = this._findApplainceFormIndex(invoiceMapForm, applianceId);
    return invoiceMapForm.controls[foundIndex];
  }

  private _findApplainceFormIndex(formArray: FormArray, applianceId: number) {
    return formArray.controls.findIndex((formControl: FormControl) => {
      return formControl.value.applianceId === applianceId;
    });
  }

  private _buildCloseCustomerModel() {
    let closeAppliances: ApplianceFixModel[] = [];
    for (let a of this.reviewForm.value.appliances) {
      let installedParts: RequestedPartCloseModel[] = [];
      for (let p of a.requestedParts) {
        if (p.partNumber) {
          installedParts.push({
            id: p.id,
            inventory_part: p.partId,
            requested_part_number: p.partNumber
          });
        }
      }
      closeAppliances.push({
        id: a.applianceId,
        requested_parts: installedParts,
        fixed: true
      });
    }
    return new CustomerCloseModel(
        this.customer.id,
        this.customer.order_status,
        this.reviewForm.value.closeReason,
        this.reviewForm.value.makeInvisible,
        closeAppliances
    );
  }
}
