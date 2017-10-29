import {Component, OnInit, ViewChild} from "@angular/core";
import {DispatcherPage} from "./dispatcher/dispatcher";
import {SettingsPage} from "./settings/settings";
import {AuthService} from "../../services/auth";
import {CustomersListPage} from "./field-work/customers-list/customers-list";
import {Tabs} from "ionic-angular";

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  isAdmin: boolean;
  dispatcherPage: any = DispatcherPage;
  fieldworkPage: any = CustomersListPage;
  settingsPage: any = SettingsPage;
  @ViewChild('mainTabs') tabsRef: Tabs;

  constructor(
      private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.getAuthData('is_organization_admin');
  }

  ionViewDidEnter() {
    if (this.isAdmin) {
      this.tabsRef.select(2);
    } else {
      this.tabsRef.select(0);
    }
  }

}
