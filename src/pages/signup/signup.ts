import { Component } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../../services/auth";
import {LoadingController, AlertController} from "ionic-angular";

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  onSignup(form: NgForm) {
    if (form.value.password !== form.value.confirm) {
      const passwordMissmatchAlert = this.alertCtrl.create({
        title: "Pssword Confirmation Mismatch",
        message: "Password andconfirmation are not the same. PLease fix this",
        buttons: ['Ok']
      });
      passwordMissmatchAlert.present();
    } else {
      const loading = this.loadingCtrl.create({
        content: "Signing up..."
      });
      loading.present();
      this.authService.signUp(form.value.f_name, form.value.l_name, form.value.email, form.value.password)
          .subscribe(
              (data) => {
                loading.dismiss();
            },
            error => {
                const signUpAlert = this.alertCtrl.create({
                  title: 'Signup failed!',
                  message: error.json(),
                  buttons: ['Ok']
                });
              loading.dismiss();
              signUpAlert.present();
            });
    }
  }
}
