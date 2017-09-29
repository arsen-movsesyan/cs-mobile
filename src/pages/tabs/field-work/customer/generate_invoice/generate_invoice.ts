import {Component, OnInit} from "@angular/core";
import {AlertController, LoadingController, ModalController, NavController, NavParams} from "ionic-angular";
import {CustomerModel} from "../../../../../models/customer";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ApplianceModel} from "../../../../../models/appliance";
import {RequestedPartModel} from "../../../../../models/requested_part";
import {AppliancePartsPage} from "./appliance_parts/appliance_parts";
import {CustomerService} from "../../../../../services/customer";
import {InvoiceCreateModel} from "../../../../../models/invoice";
import {InvoicePartModel} from "../../../../../models/invoice_part";
import {InvoiceApplianceCreateModel} from "../../../../../models/invoice_appliance";

@Component({
  selector: 'page-generate-invoice',
  templateUrl: 'generate_invoice.html'
})
export class GenerateInvoicePage implements OnInit {
  private customer: CustomerModel;
  private invoiceForm: FormGroup;
  private taxIncluded: FormControl;
  private includedAppliances: {
    appliance: ApplianceModel,
    toggle: FormControl,
    includedParts: {
      part: RequestedPartModel,
      toggle: FormControl
    }[]
  }[] = [];
  private invoiceTypeDocument: string;

  constructor(
      private navParams: NavParams,
      private formBuilder: FormBuilder,
      private modalCtrl: ModalController,
      private navCtrl: NavController,
      private customerService: CustomerService,
      private loadCtrl: LoadingController,
      private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.customer = this.navParams.get('customer');
    this.invoiceForm = this.formBuilder.group({
      invoiceType: 'invoice',
      laborPrice: [null, [Validators.required]],
      // taxIncluded: this.customer.organization.settings_tax_included,
      // decimalTaxPercent: this.customer.organization.settings_default_tax ? this.customer.organization.settings_default_tax : 9.5,
      paymentType: 1,
      closeOrder: false,
      closeReason: null,
      description: null,
      mapAppliances: this.formBuilder.array([])
    });
    this.initiateApplianceArray();
    this.invoiceTypeDocument = 'labor';
    this.taxIncluded = this.formBuilder.control(this.customer.organization.settings_tax_included);
    this.taxIncluded.value ? this._includeTax() : this._excludeTax();
  }

  initiateApplianceArray() {
    const invoiceMapForm = this.invoiceForm.controls['mapAppliances'] as FormArray;
    for (const a of this.customer.appliances) {
      if ((!a.fixed) && (!a.canceled)) {

        const applianceFormGroup = this.formBuilder.group({
          applianceId: a.id,
          leaveUnfixed: false,
          requestedParts: this.formBuilder.array([])
        });
        const suplimentalObject = {
          appliance: a,
          toggle: this.formBuilder.control(true),
          includedParts: []
        };
        for (const p of a.requested_parts) {
          if (p.inventory_part.part_status === 3) {
            const partsArrayForm = applianceFormGroup.controls['requestedParts'] as FormArray;
            partsArrayForm.push(this.formBuilder.group({
              partId: p.inventory_part.id,
              partNumber: p.requested_part_number,
              partPrice: [null, Validators.required]
            }));
            suplimentalObject.includedParts.push({
              part: p,
              toggle: this.formBuilder.control(true)
            });
          }
        }
        this.includedAppliances.push(suplimentalObject);
        invoiceMapForm.push(applianceFormGroup);
      }
    }
  }

  toggleTaxInclude(element) {
    element.checked ? this._includeTax() : this._excludeTax();
  }

  onSegmentChange(element) {
    switch (element.value) {
      case 'invoice':
          this.initiateApplianceArray();
          break;
      case 'service_fee':
          this.includedAppliances = [];
          this.invoiceForm.controls.mapAppliances = this.formBuilder.array([]);
          break;
    }
  }

  onSelectAppliance(index: number) {
    let applianceWithParts = this.includedAppliances[index].appliance;
    let applianceFormGroup = this._getApplianceGroupById(applianceWithParts.id);
    const applianceParts = this.modalCtrl.create(AppliancePartsPage,{
      // appliance: applianceWithParts,
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

  onToggleApplianceInclude(element, appliance: ApplianceModel) {
    element.checked ? this._addApplianceToForm(appliance) : this._removeApplianceFromForm(appliance);
  }

  onInvoiceSubmit() {
    const generatedInvoice = this._buildInvoiceModel();
    // console.log(generatedInvoice);

    const loading = this.loadCtrl.create({
      content: 'Generating new invoice...'
    });
    loading.present().then();
    this.customerService.generateInvoice(
        this.customer.id,
        generatedInvoice)
        .subscribe(
            () => {
            loading.dismiss().then(
                () => {
                  this.invoiceForm.reset();
                  this.navCtrl.pop().then();
                }
            );
        },
            err => {
                loading.dismiss().then(
                    () => {
                      console.log(err);
                      console.log(err.json());
                      const alert = this.alertCtrl.create({
                        title: 'Cannot create new invoice!',
                        message: err.json(),
                        buttons: ['Close']
                      });
                      alert.present().then();
                    }
                );

            });
  }

  private _getApplianceGroupById(applianceId: number) {
    const invoiceMapForm = this.invoiceForm.controls['mapAppliances'] as FormArray;
    const foundIndex = this._findApplainceFormIndex(invoiceMapForm, applianceId);
    return invoiceMapForm.controls[foundIndex];
  }

  private _addApplianceToForm(appliance: ApplianceModel) {
    const invoiceMapForm = this.invoiceForm.controls['mapAppliances'] as FormArray;
    const foundIndex = this._findApplainceFormIndex(invoiceMapForm, appliance.id);
    const fg = invoiceMapForm.controls[foundIndex] as FormGroup;
    fg.addControl('leaveUnfixed', this.formBuilder.control(false));
    fg.addControl('requestedParts', this.formBuilder.array([]));
    for (const p of appliance.requested_parts) {
      if (p.inventory_part.part_status === 3) {
        const partsArrayForm = fg.controls['requestedParts'] as FormArray;
        partsArrayForm.push(this.formBuilder.group({
          partId: p.inventory_part.id,
          partPrice: [null, Validators.required]
        }));
      }
    }
  }

  private _removeApplianceFromForm(appliance: ApplianceModel) {
    const invoiceMapForm = this.invoiceForm.controls['mapAppliances'] as FormArray;
    const foundIndex = this._findApplainceFormIndex(invoiceMapForm, appliance.id);
    const fg = invoiceMapForm.controls[foundIndex] as FormGroup;
    fg.removeControl('leaveUnfixed');
    fg.removeControl('requestedParts');
  }

  private _findApplainceFormIndex(formArray: FormArray, applianceId: number) {
    console.log(formArray.value, applianceId);
    return formArray.controls.findIndex((formControl: FormControl) => {
      return formControl.value.applianceId === applianceId;
    });
  }

  private _buildInvoiceModel() {
    let invoiceAppliances: InvoiceApplianceCreateModel[] = [];
    for (let a of this.invoiceForm.value.mapAppliances) {
      if (a.requestedParts) {
        let invoiceParts: InvoicePartModel[] = [];
        for (let p of a.requestedParts) {
          if (p.partPrice) {
            invoiceParts.push(new InvoicePartModel(p.partId, p.partNumber, p.partPrice));
          }
        }
        invoiceAppliances.push(new InvoiceApplianceCreateModel(null, a.applianceId, invoiceParts, a.leaveUnfixed));
      }
    }
    return new InvoiceCreateModel(
        null,
        this.invoiceForm.value.invoiceType,
        this.invoiceForm.value.laborPrice,
        this.invoiceForm.value.decimalTaxPercent || '0',
        +this.invoiceForm.value.decimalTaxPercent,
        this.invoiceForm.value.paymentType,
        null,
        this.invoiceForm.value.description,
        invoiceAppliances,
        this.invoiceForm.value.closeOrder,
        this.invoiceForm.value.closeReason,
        this.customer.order_status
    );
  }

  private _includeTax() {
    const dtp = this.customer.organization.settings_default_tax ? this.customer.organization.settings_default_tax : 9.5;
    this.invoiceForm.addControl(
        'decimalTaxPercent',
        this.formBuilder.control(dtp, [Validators.required]));
  }

  private _excludeTax() {
    this.invoiceForm.removeControl('decimalTaxPercent');
  }
}
