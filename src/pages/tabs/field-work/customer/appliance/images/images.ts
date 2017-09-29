import {Component, OnInit} from "@angular/core";
import {AlertController, LoadingController, NavParams} from "ionic-angular";
import {Camera} from "@ionic-native/camera";
import {ApplianceModel} from "../../../../../../models/appliance";
import {FileTransferService} from "../../../../../../services/file-transfer";
import {AppliancePictureModel} from "../../../../../../models/appliance_picture";

@Component({
  selector: 'page-images',
  templateUrl: 'images.html'
})
export class ImagesPage implements OnInit{
  private appliance: ApplianceModel;

  constructor(
    private navParamsCtrl: NavParams,
    private camera: Camera,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private imageTransService: FileTransferService
  ) {}

  ngOnInit() {
    this.appliance = this.navParamsCtrl.get('appliance');
  }

  onTakeStickerImage() {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      correctOrientation: true
    })
        .then(
            (imageData) => {
              const loading = this.loadingCtrl.create({
                content: 'Uploading sticker...'
              });
              loading.present().then();
              this.imageTransService.uploadImage(imageData, this.appliance.id, 'stickerImage')
                  .then(
                      () => {
                        loading.dismiss().then();
                        this.appliance.sticker_image = imageData;
                      }
                  )
                  .catch(
                      err => {
                        loading.dismiss().then();
                        const uploadAlert = this.alertCtrl.create({
                          title: 'Cannot upload sticker!',
                          message: err.json(),
                          buttons: ['Close']
                        });
                        uploadAlert.present().then();
                        console.log(err);
                      });
                })
        .catch(
            err => {
              console.log(err);
              const pictureAlert = this.alertCtrl.create({
                  title: 'Cannot take picture!',
                  message: err,
                  buttons: ['Close']
                });
                pictureAlert.present().then();
            });
  }

  onTakePicture() {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      correctOrientation: true
    })
        .then(
            (imageData) => {
              const loading = this.loadingCtrl.create({
                content: 'Uploading picture...'
              });
              loading.present().then();
              this.imageTransService.uploadImage(imageData, this.appliance.id, 'appliancePicture')
                  .then(
                      () => {
                        loading.dismiss().then();
                        this.appliance.pictures.push(imageData);
                      }
                  )
                  .catch(
                      err => {
                        loading.dismiss().then();
                        const uploadAlert = this.alertCtrl.create({
                          title: 'Cannot upload picture!',
                          message: err.json(),
                          buttons: ['Close']
                        });
                        uploadAlert.present().then();
                        console.log(err);
                      }
                  );

            })
        .catch(
            err => {
              console.log(err);
              const pictureAlert = this.alertCtrl.create({
                title: 'Cannot take picture!',
                message: err,
                buttons: ['Close']
              });
              pictureAlert.present().then();
            });
  }

  onRemovePicture(id: number) {
    const alert = this.alertCtrl.create({
      title: 'Warning!',
      subTitle: 'Are you sure you want to remove this picture?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let picIndex = this.appliance.pictures.findIndex((pictureEl: AppliancePictureModel) => {
              return pictureEl.id == id;
            });
            const loading = this.loadingCtrl.create({
              content: 'Removing picture...'
            });
            loading.present().then();
            this.imageTransService.deleteImage(id, this.appliance.id, 'appliancePicture')
                .subscribe(
                    () => {
                      loading.dismiss().then();
                      this.appliance.pictures.splice(picIndex, 1);
                    },
                    err => {
                      loading.dismiss().then();
                      const errAlert = this.alertCtrl.create({
                        title: 'Cannot delete picture!',
                        message: err,
                        buttons: ['Close']
                      });
                      errAlert.present().then();
                    }
                );
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    alert.present().then();
  }

}
