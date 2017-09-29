import {Component, OnInit} from "@angular/core";
import {DispatcherPage} from "./dispatcher/dispatcher";
import {SettingsPage} from "./settings/settings";
import {AuthService} from "../../services/auth";
import {CustomersListPage} from "./field-work/customers-list/customers-list";

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  isAdmin: boolean;
  dispatcherPage: any = DispatcherPage;
  fieldworkPage: any = CustomersListPage;
  settingsPage: any = SettingsPage;

  constructor(
      private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.getAuthData('is_organization_admin');
  }
}
