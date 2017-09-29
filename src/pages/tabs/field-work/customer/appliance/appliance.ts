import {Component, OnInit} from "@angular/core";
import {
  ActionSheet,
  ActionSheetController, AlertController, ItemSliding, LoadingController, ModalController, NavController, NavParams
} from "ionic-angular";

import {ImagesPage} from "./images/images";
import {
  ApplianceCreateModel, ApplianceFixModel, ApplianceModel,
  ApplianceUnfixModel
} from "../../../../../models/appliance";
import {EditAppliancePage} from "../edit_appliance/edit_appliance";
import {CustomerService} from "../../../../../services/customer";
import {RequestedPartCloseModel, RequestedPartModel, UninstallPartModel} from "../../../../../models/requested_part";
import {CloseAppliancePartsPage} from "../close-review/close_appliance_parts/close_appliance_parts";
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {InstalledPartModel} from "../../../../../models/installed_part";
import {UnfixAppliancePartsPage} from "./unfix-appliance-parts/unfix-appliance-parts";

@Component({
  selector: 'page-appliance',
  templateUrl: 'appliance.html'
})
export class AppliancePage implements OnInit {
  appliance: ApplianceModel;
  parts: {
    requestedPart: RequestedPartModel,
    installedPart: InstalledPartModel,
    inventoryPartStatus: number,
    statusReadable: string,
    iconColor: string
  }[] = [];
  customerId: number;

  constructor(
      private navParamsCtrl: NavParams,
      private navCtrl: NavController,
      private actionSheetCtrl: ActionSheetController,
      private modalCtrl: ModalController,
      private customerService: CustomerService,
      private loadCtrl: LoadingController,
      private alertCtrl: AlertController,
      private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.appliance = this.navParamsCtrl.get('appliance');
    this.customerId = this.navParamsCtrl.get('customerId');
    this._initParts();
  }

  onShowOptions() {
    let actionSheet: ActionSheet;
    if (!this.appliance.fixed) {
      actionSheet = this.actionSheetCtrl.create({
        title: 'Choose action',
        buttons: [
          {
            text: 'Request part',
            handler: () => {
              const requestAlert = this.alertCtrl.create({
                title: 'Enter part number',
                inputs: [
                  {
                    name: 'partNumber'
                  }
                ],
                buttons: [
                  {
                    text: 'Request',
                    handler: data => {
                      const loading = this.loadCtrl.create({
                        content: 'Adding new request...'
                      });
                      loading.present().then();
                      this.customerService.requestPart(data.partNumber, this.appliance.id)
                          .subscribe(
                              (newPart: RequestedPartModel) => {
                                loading.dismiss().then();
                                this.appliance.requested_parts.push(newPart);
                                this._initParts();
                              },
                              err => {
                                loading.dismiss().then();
                                const failAlert = this.alertCtrl.create({
                                  title: 'Failed to create new request!',
                                  message: err.json(),
                                  buttons: ['Close']
                                });
                                failAlert.present().then();
                              }
                          );
                    }
                  },
                  {
                    text: 'Cancel',
                    role: 'cancel'
                  }
                ]
              });
              requestAlert.present().then();
            }
          },
          {
            text: 'Edit appliance',
            handler: () => {
              const applianceModal = this.modalCtrl.create(EditAppliancePage, {
                mode: 'update',
                appliance: this.appliance
              });
              applianceModal.present().then();
              applianceModal.onDidDismiss((updatedAppliance: ApplianceCreateModel) => {
                if (updatedAppliance) {
                  const loading = this.loadCtrl.create({
                    content: 'Updating appliance...'
                  });
                  loading.present().then();
                  this.customerService.updateAppliance(updatedAppliance, this.customerId)
                      .subscribe((appliance: ApplianceModel) => {
                            loading.dismiss().then();
                            this.appliance = appliance;
                          },
                          err => {
                            loading.dismiss().then();
                            console.log(err);
                            console.log(err.json());
                            const alert = this.alertCtrl.create({
                              title: 'Cannot update appliance!',
                              message: err.json(),
                              buttons: ['Close']
                            });
                            alert.present().then();
                          });
                }
              });
            }
          },
          {
            text: 'Fix appliance',
            handler: () => {
              const applianceObject = {
                appliance: this.appliance,
                includedParts: []
              };
              const applianceFormGroup = this.formBuilder.group({
                applianceId: this.appliance.id,
                requestedParts: this.formBuilder.array([])
              });
              if (this._availablePartsPresent('Available')) {
                for (const p of this.appliance.requested_parts) {
                  if (this._statusReadable(p) === 'Available') {
                    const partsArrayForm = applianceFormGroup.controls['requestedParts'] as FormArray;
                    partsArrayForm.push(this.formBuilder.group({
                      id: p.id,
                      partId: p.inventory_part.id,
                      partNumber: p.requested_part_number
                    }));
                    applianceObject.includedParts.push({
                      toggle: this.formBuilder.control(true),
                      part: p
                    });
                  }
                }
                const fixModal = this.modalCtrl.create(CloseAppliancePartsPage, {
                  includedApplianceObject: applianceObject,
                  partsFormGroup: applianceFormGroup
                });
                fixModal.present().then();
                fixModal.onDidDismiss((formGroup: FormGroup) => {
                  if (formGroup) {
                    this._performFixAppliance(this._buildApplianceFixModel(formGroup.value));
                  }
                });
              } else {
                const confirmAlert = this.alertCtrl.create({
                  title: 'Are you sure you want to make this appliance fixed?',
                  buttons: [
                    {
                      text: 'No',
                      role: 'cancel'
                    },
                    {
                      text: 'Yes',
                      handler: () => {
                        this._performFixAppliance(this._buildApplianceFixModel(applianceFormGroup.value));
                      }
                    }
                  ]
                });
                confirmAlert.present().then();
              }
            }
          },
          {
            text: 'Delete appliance',
            role: 'destructive',
            handler: () => {
              this._deleteAppliance();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
    } else {
      actionSheet = this.actionSheetCtrl.create({
        title: 'Choose action',
        buttons: [
          {
            text: 'Unfix',
            handler: () => {
              const applianceObject = {
                appliance: this.appliance,
                includedParts: []
              };
              const applianceFormGroup = this.formBuilder.group({
                applianceId: this.appliance.id,
                installedParts: this.formBuilder.array([])
              });
              if (this._availablePartsPresent('Installed')) {
                for (const p of this.appliance.installed_parts) {

                  const partsArrayForm = applianceFormGroup.controls['installedParts'] as FormArray;
                  partsArrayForm.push(this.formBuilder.group({
                    installedId: p.id,
                    inventoryId: p.inventory_part.id
                  }));
                  applianceObject.includedParts.push({
                    toggle: this.formBuilder.control(true),
                    part: p
                  });
                }
                const unfixModal = this.modalCtrl.create(UnfixAppliancePartsPage, {
                  includedApplianceObject: applianceObject,
                  partsFormGroup: applianceFormGroup
                });
                unfixModal.present().then();
                unfixModal.onDidDismiss((formGroup: FormGroup) => {
                  if (formGroup) {
                    this._performUnfixAppliance(this._buildApplianceUnfixModel(formGroup.value));
                  }
                });

              } else {
                const confirmAlert = this.alertCtrl.create({
                  title: 'Are you sure you want to unfix this appliance?',
                  buttons: [
                    {
                      text: 'No',
                      role: 'cancel'
                    },
                    {
                      text: 'Yes',
                      handler: () => {
                        this._performUnfixAppliance(this._buildApplianceUnfixModel(applianceFormGroup.value))
                      }
                    }
                  ]
                });
                confirmAlert.present().then();
              }
            }
          },
          {
            text: 'Delete appliance',
            role: 'destructive',
            handler: () => {
              this._deleteAppliance();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
    }
    actionSheet.present().then();
  }

  onCancelRequest(part: RequestedPartModel, slidingItem: ItemSliding) {
    slidingItem.close();
    const alert = this.alertCtrl.create({
      title: 'WARNING!',
      subTitle: 'Are you sure you want to cancel this part?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            const loading = this.loadCtrl.create({
              content: 'Canceling request...'
            });
            loading.present().then();
            this.customerService.cancelRequest(part.id, this.appliance.id)
                .subscribe(
                    () => {
                        loading.dismiss().then();
                        const foundIndex = this.appliance.requested_parts.findIndex((foundPart: RequestedPartModel) => {
                          return foundPart.id === part.id;
                        });
                      this.appliance.requested_parts.splice(foundIndex, 1);
                      this._initParts();
                    },
                    err => {
                      loading.dismiss().then();
                      const failedAlert = this.alertCtrl.create({
                        title: 'Falied to cancel request!',
                        message: err.json(),
                        buttons: ['Close']
                      });
                      failedAlert.present().then();
                    });
          }
        }
      ]
    });
    alert.present().then();
  }

  onUninstall(part: InstalledPartModel, slidingItem: ItemSliding) {
    slidingItem.close();
    const alert = this.alertCtrl.create({
      title: 'WARNING!',
      subTitle: 'Are you sure you want to uninstall this part?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            const loading = this.loadCtrl.create({
              content: 'Uninstalling part...'
            });
            loading.present().then();
            this.customerService.uninstallPart(part.id, this.appliance.id)
                .subscribe(() => {
                  loading.dismiss().then();
                  this._initParts();
                },
                err => {
                  loading.dismiss().then();
                  console.log(err);
                  console.log(err.json());
                  const alert = this.alertCtrl.create({
                    title: 'Failed to uninstall part!',
                    message: err.json(),
                    buttons: ['Close']
                  });
                  alert.present().then();
                });
          }
        }
      ]
    });
    alert.present().then();
  }

  onImagesLoad() {
    this.navCtrl.push(ImagesPage, {'appliance': this.appliance}).then();
  }

  private _statusReadable(part: RequestedPartModel) {
    switch (part.inventory_part.part_status) {
      case 1:
        return 'Requested';
      case 2:
        return 'Ordered';
      case 3:
        for (let installed of this.appliance.installed_parts) {
          if (installed.inventory_part.id === part.inventory_part.id) {
            return 'Installed';
          }
        }
        return 'Available';
    }

  }

  private _buildApplianceFixModel(formGroupValue: any) {
    let toInstalledParts: RequestedPartCloseModel[] = [];
    for (let p of formGroupValue.requestedParts) {
      if (p.partNumber) {
        toInstalledParts.push(new RequestedPartCloseModel(
            p.id, p.partNumber, p.partId
        ));
      }
    }
    return new ApplianceFixModel(
        this.appliance.id, toInstalledParts, !this.appliance.fixed
    );
  }

  private _buildApplianceUnfixModel(formGroupValue: any) {
    let toUninstalledParts: UninstallPartModel[] = [];
    for (let p of formGroupValue.installedParts) {
      if (p.inventoryId) {
        toUninstalledParts.push(new UninstallPartModel(
            p.installedId, p.inventoryId
        ));
      }
    }
    return new ApplianceUnfixModel(
        this.appliance.id, toUninstalledParts, '', !this.appliance.fixed
    );
  }

  private _performFixAppliance(oldAppliance: ApplianceFixModel) {
    // console.log(oldAppliance);
    const loading = this.loadCtrl.create({
      content: 'Fixing appliance...'
    });
    loading.present().then();
    this.customerService.fixAppliance(this.customerId, oldAppliance)
        .subscribe(() => {
              loading.dismiss().then();
              this.navCtrl.pop().then();
            },
            err => {
              loading.dismiss().then();
              console.log(err);
              console.log(err.json());
              const alert = this.alertCtrl.create({
                title: 'Failed to fix appliance!',
                message: err.json(),
                buttons: ['Close']
              });
              alert.present().then();
            });
  }

  private _performUnfixAppliance(oldAppliance: ApplianceUnfixModel) {
    const loading = this.loadCtrl.create({
      content: 'Unfixing appliance...'
    });
    this.customerService.unfixAppliance(this.customerId, oldAppliance)
        .subscribe(() => {
              loading.dismiss().then();
              this.navCtrl.pop().then();
            },
            err => {
              loading.dismiss().then();
              console.log(err);
              console.log(err.json());
              const alert = this.alertCtrl.create({
                title: 'Failed to unfix appliance!',
                message: err.json(),
                buttons: ['Close']
              });
              alert.present().then();
            });
  }

  private _deleteAppliance() {
    const deleteAlert = this.alertCtrl.create({
      title: 'WARNING!',
      subTitle: 'Are you sure you want to delete this appliance?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            const loading = this.loadCtrl.create({
              content: 'Deleting appliance...'
            });
            loading.present().then();
            this.customerService.deleteAppliance(this.appliance.id, this.customerId)
                .subscribe(
                    () => {
                      loading.dismiss().then();
                      this.navCtrl.pop().then();
                    },
                    err => {
                      loading.dismiss().then();
                      const alert = this.alertCtrl.create({
                        title: 'Cannot delete appliance!',
                        message: err.json(),
                        buttons: ['Close']
                      });
                      alert.present().then();
                    }
                );
          }
        }
      ]
    });
    deleteAlert.present().then();
  }

  private _getIconColor(part: RequestedPartModel) {
    const status = this._statusReadable(part);
    switch (status) {
      case 'Requested':
      case 'Ordered':
        return 'primary';
      case 'Available':
        return 'secondary';
      case 'Installed':
        return 'Dark';
    }
  }

  private _getInstalledPart(part: RequestedPartModel) {
    let inventoryPartId: number = null;
    for (let p of this.appliance.requested_parts) {
      if (p.id === part.id) {
        inventoryPartId = p.inventory_part.id;
      }
    }
    for (let inst of this.appliance.installed_parts) {
      if (inst.inventory_part.id === inventoryPartId) {
        return inst;
      }
    }
    return null;
  }

  private _initParts() {
    this.parts = [];
    for (const p of this.appliance.requested_parts) {
      let installedPart: InstalledPartModel = null;
      if (this._statusReadable(p) === 'Installed') {
        installedPart = this._getInstalledPart(p);
      }
      this.parts.push({
        requestedPart: p,
        installedPart: installedPart,
        inventoryPartStatus: p.inventory_part.part_status,
        statusReadable: this._statusReadable(p),
        iconColor: this._getIconColor(p)
      });
    }
  }

  private _availablePartsPresent(checkStatus: string) {
    for (let p of this.parts) {
      if (p.statusReadable === checkStatus) {
        return true;
      }
    }
    return false;
  }
}
