/*
 * Created by Arsen Movsesyan on 9/26/17.
 */
import {Component, OnInit} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {ApplianceModel} from "../../../../../../models/appliance";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {RequestedPartModel} from "../../../../../../models/requested_part";

@Component({
  selector: 'page-close-appliance-parts',
  templateUrl: 'close_appliance_parts.html'
})
export class CloseAppliancePartsPage implements OnInit {
  private partsForm: FormGroup;
  private includedAppliance: {
    appliance: ApplianceModel,
    includedParts: {
      toggle: FormControl,
      part: RequestedPartModel
    }[]
  };

  constructor(
      private navParams: NavParams,
      private viewCtrl: ViewController,
      private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.partsForm = this.navParams.get('partsFormGroup');
    this.includedAppliance = this.navParams.get('includedApplianceObject');
  }

  togglePartIncluded(element, part: RequestedPartModel) {
    element.checked ? this._addPartToForm(part) : this._removePartFromForm(part);
  }

  onSubmit() {
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
