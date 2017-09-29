/*
 * Created by Arsen Movsesyan on 9/23/17.
 */

import {Injectable} from "@angular/core";
import {AuthService} from "./auth";
import {Http} from "@angular/http";
import {ConstantsService} from "./constants";
import {FileTransfer, FileTransferObject} from "@ionic-native/file-transfer";

@Injectable()
export class FileTransferService {
  constructor(
      private authService: AuthService,
      private http: Http,
      private transfer: FileTransfer,
      private constants: ConstantsService
  ) {}

  uploadImage(imageData, applianceId: number, role: string) {
    let url: string;
    switch (role) {
      case 'stickerImage':
        url = this.constants.getBaseApiUrl() + '/appliance/sticker_image/' + applianceId + '/';
        break;
      case 'appliancePicture':
        url = this.constants.getBaseApiUrl() + '/appliance/' + applianceId + '/pictures/';
        break;
    }
    let currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
    // let newPicture = new AppliancePictureModel(null, currentName, imageData);

    const imageTransfer: FileTransferObject = this.transfer.create();
    return imageTransfer.upload(imageData, url, {
      fileKey: 'sticker_image',
      fileName: currentName,
      headers: this.authService.getAuthHeader()
    });
  }

  deleteImage(pictureId: number, applianceId: number, role: string) {
    let url: string;
    switch (role) {
      case 'stickerImage':
        url = this.constants.getBaseApiUrl() + '/appliance/sticker_image/' + applianceId + '/';
        break;
      case 'appliancePicture':
        url = this.constants.getBaseApiUrl() + '/appliance/' + applianceId + '/pictures/' + pictureId + '/';
        break;
    }
    return this.http.delete(url, {headers: this.authService.getAuthHeader()});
  }
}
