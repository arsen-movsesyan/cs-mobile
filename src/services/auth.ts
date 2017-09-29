/*
 * Created by Arsen Movsesyan on 9/21/17.
 */
import {EventEmitter, Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Storage} from "@ionic/storage";
import {ConstantsService} from "./constants";
import {AuthModel} from "../models/auth";
import 'rxjs/Rx';

@Injectable()
export class AuthService {
  token: string;
  authData: AuthModel;
  authStateChanged = new EventEmitter<boolean>();

  constructor(
      private http: Http,
      private storage: Storage,
      private constants: ConstantsService
  ) {
    storage.get('token')
        .then((token: string) => {
          this.token = token;
          if(this.token) {
            this.http.get(
                this.constants.getBaseApiUrl() + '/auth/validate/',
                {
                  headers: this.getAuthHeader()
                })
                .subscribe(
                    (response: Response) => {
                      this._setAuthData(response.json());
                    },
                    error => {
                      console.log(error);
                      this.signOut();
                    }
                );
          }
        })
        .catch()
  }

  signIn(email: string, password: string) {
    return this.http.post(
        this.constants.getBaseApiUrl() + '/auth/login/',
        {
          email: email,
          password: password
        }
    )
        .map((response: Response) => response.json())
        .do((authData: AuthModel) => {
          this._setAuthData(authData);
        });
  }

  signUp(firstName: string, lastName: string, email: string, password: string) {
    let data = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password
    };
    return this.http.post(this.constants.getBaseApiUrl() + '/auth/signup/', data)
        .map((response: Response) => response.json())
        .do((authData: AuthModel) => {
          this._setAuthData(authData);
        });
  }

  signOut() {
    this.storage.remove('token').then();
    this.token = null;
    this.authData = null;
    this.authStateChanged.emit(false);
  }

  getAuthHeader() {
    if (this.token) {
      const headers = new Headers();
      headers.append('Authorization', 'Token ' + this.token);
      return headers;
    }
    return null;
  }

  getAuthData(key: string) {
    for (let k in this.authData) {
      if (k === key) {
        return this.authData[key];
      }
    }
    return null;
  }

  private _setAuthData(authData: AuthModel) {
    this.authData = authData;
    this.token = authData.token;
    this.storage.set('token', this.token).then();
    this.authStateChanged.emit(true);
    console.log(this.authData);
    // this.fetchCustomers();
  }
}
