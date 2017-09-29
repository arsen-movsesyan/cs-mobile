/*
 * Created by Arsen Movsesyan on 9/26/17.
 */
import {Component, OnInit} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {ApplianceModel} from "../../../../../../models/appliance";
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {InstalledPartModel} from "../../../../../../models/installed_part";

@Component({
  selector: 'page-unfix-appliance-parts',
  templateUrl: 'unfix-appliance-parts.html'
})
export class UnfixAppliancePartsPage implements OnInit {
  private partsForm: FormGroup;
  private includedAppliance: {
    appliance: ApplianceModel,
    includedParts: {
      toggle: FormControl,
      part: InstalledPartModel
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

  togglePartIncluded(element, part: InstalledPartModel) {
    element.checked ? this._addPartToForm(part) : this._removePartFromForm(part);
  }

  onSubmit() {
    this.viewCtrl.dismiss(this.partsForm).then();
  }

  onCancel() {
    this.viewCtrl.dismiss().then();
  }

  private _addPartToForm(part: InstalledPartModel) {
    const partsArrayForm = this.partsForm.controls['installedParts'] as FormArray;
    const foundIndex = this._findPartFormIndex(partsArrayForm, part.id);
    const fg = partsArrayForm.controls[foundIndex] as FormGroup;
    fg.addControl('inventoryId', this.formBuilder.control(part.inventory_part.id));
  }

  private _removePartFromForm(part: InstalledPartModel) {
    const partsArrayForm = this.partsForm.controls['installedParts'] as FormArray;
    const foundIndex = this._findPartFormIndex(partsArrayForm, part.id);
    const fg = partsArrayForm.controls[foundIndex] as FormGroup;
    fg.removeControl('inventoryId');
  }

  private _findPartFormIndex(formArray: FormArray, partId: number) {
    return formArray.controls.findIndex((formControl: FormControl) => {
      return formControl.value.installedId === partId;
    });
  }
}
