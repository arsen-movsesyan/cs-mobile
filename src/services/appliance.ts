/*
 * Created by Arsen Movsesyan on 9/22/17.
 */
import {Injectable} from "@angular/core";
import {ApplianceTypeModel} from "../models/appliance_type";
import {Http, Response} from "@angular/http";
import {Storage} from "@ionic/storage";
import {ConstantsService} from "./constants";

@Injectable()
export class ApplianceService {
  applianceTypes: ApplianceTypeModel[];

  constructor(
      private http: Http,
      private storage: Storage,
      private constants: ConstantsService
  ) {
    storage.get('applianceTypes')
        .then((applianceTypes: ApplianceTypeModel[]) => {
          if (applianceTypes) {
            this.applianceTypes = applianceTypes;
          } else {
            this.fetchApplianceTypes();
          }
        })
        .catch();
  }

  getApplianceTypeById(id: number) {
    for (let a of this.applianceTypes) {
      if (a.id === id) {
        return a;
      }
    }
    return null;
  }

  fetchApplianceTypes() {
    this.http.get(this.constants.getBaseApiUrl() + '/appliance_types/')
        .subscribe(
            (data: Response) => {
              this.applianceTypes = data.json().results;
              this.storage.set('applianceTypes', this.applianceTypes);
            }
        );
  }
}
