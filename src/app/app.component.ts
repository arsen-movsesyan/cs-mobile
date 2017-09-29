import {Component, OnDestroy, ViewChild} from '@angular/core';
import {MenuController, NavController, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {TabsPage} from "../pages/tabs/tabs";
import {AuthService} from "../services/auth";
import {SigninPage} from "../pages/signin/signin";
import {SignupPage} from "../pages/signup/signup";
import {ApplianceService} from "../services/appliance";

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnDestroy {
  rootPage: any;
  signinPage = SigninPage;
  signupPage = SignupPage;
  isAuthenticated = false;
  @ViewChild('nav') nav: NavController;

  constructor(
      platform: Platform,
      statusBar: StatusBar,
      splashScreen: SplashScreen,
      private authService: AuthService,
      private menuCtrl: MenuController,
      private applianceService: ApplianceService
  ) {
    platform.ready()
        .then(() => {
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
          statusBar.styleDefault();
          splashScreen.hide();
          this._startPageLoad();
          this.authService.authStateChanged
              .subscribe((isAuth: boolean) => {
                this.isAuthenticated = isAuth;
                this._startPageLoad();
              });
          this.applianceService.fetchApplianceTypes();
    });
  }

  onLoad(page: any) {
    this.menuCtrl.close().then(
        () =>  {
          this.nav.setRoot(page).then();
        }
    );
  }

  onLogout() {
    this.menuCtrl.close().then(
        () => {
          this.authService.signOut();
          this.nav.setRoot(SigninPage).then();
        }
    );
  }

  private _startPageLoad() {
    if (this.isAuthenticated) {
      this.rootPage = TabsPage;
    } else {
      this.rootPage = SigninPage;
    }
  }

  ngOnDestroy() {
    this.authService.authStateChanged.unsubscribe();
  }

}
