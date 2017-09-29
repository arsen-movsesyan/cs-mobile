import {Component, OnInit} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ApplianceModel} from "../../../../../../models/appliance";
import {RequestedPartModel} from "../../../../../../models/requested_part";

@Component({
  selector: 'page-appliance-parts',
  templateUrl: 'appliance_parts.html'
})
export class AppliancePartsPage implements OnInit {
  // private appliance: ApplianceModel;
  private partsForm: FormGroup;
  private includedAppliance:  {
    appliance: ApplianceModel,
    toggle: FormControl,
    includedParts: {
      part: RequestedPartModel,
      toggle: FormControl
    }[]
  };

  constructor(
      private viewCtrl: ViewController,
      private navParams: NavParams,
      private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    // this.appliance = this.navParams.get('appliance');
    this.partsForm = this.navParams.get('partsFormGroup');
    this.includedAppliance = this.navParams.get('includedApplianceObject');
  }

  togglePartIncluded(element, part: RequestedPartModel) {
    element.checked ? this._addPartToForm(part) : this._removePartFromForm(part);
  }

  onSubmit() {
    // let includedAppliance = this.partsForm.value;
    this.viewCtrl.dismiss(this.partsForm).then();
  }

  onCancel() {
    this.viewCtrl.dismiss().then();
  }

  private _addPartToForm(part: RequestedPartModel) {
    const partsArrayForm = this.partsForm.controls['requestedParts'] as FormArray;
    const foundIndex = this._findPartFormIndex(partsArrayForm, part.inventory_part.id);
    const fg = partsArrayForm.controls[foundIndex] as FormGroup;
    fg.addControl('partNumber', this.formBuilder.control(part.requested_part_number));
    fg.addControl('partPrice', this.formBuilder.control(null, [Validators.required]));
  }

  private _removePartFromForm(part: RequestedPartModel) {
    const partsArrayForm = this.partsForm.controls['requestedParts'] as FormArray;
    const foundIndex = this._findPartFormIndex(partsArrayForm, part.inventory_part.id);
    const fg = partsArrayForm.controls[foundIndex] as FormGroup;
    fg.removeControl('partNumber');
    fg.removeControl('partPrice');
  }

  private _findPartFormIndex(formArray: FormArray, partId: number) {
    return formArray.controls.findIndex((formControl: FormControl) => {
      return formControl.value.partId === partId;
    });
  }
}
