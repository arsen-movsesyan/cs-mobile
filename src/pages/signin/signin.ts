import { Component } from '@angular/core';
import {AuthService} from "../../services/auth";
import {AlertController, LoadingController} from "ionic-angular";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {
  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  onSignin(form: NgForm) {
    const loading = this.loadingCtrl.create({
      content: 'Signing in...'
    });
    loading.present();
    this.authService.signIn(form.value.email, form.value.password)
      .subscribe((data) => {
              loading.dismiss();
        },
        error => {
            loading.dismiss();
            console.log(error);
            console.log(error.json());
            const alert = this.alertCtrl.create({
                title: 'Signin faled!',
                message: error.json().detail,
                buttons: ['Ok']
            });
            alert.present();
        });
  }
}
