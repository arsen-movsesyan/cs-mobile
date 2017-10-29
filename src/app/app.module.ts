import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Geolocation } from "@ionic-native/geolocation";
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { CallNumber } from "@ionic-native/call-number";
import { IonicStorageModule } from "@ionic/storage";
import { HttpModule } from "@angular/http";
import {AgmCoreModule, GoogleMapsAPIWrapper} from "@agm/core";
import {CalendarComponent} from "ap-angular2-fullcalendar/src/calendar/calendar";
import {Calendar} from "@ionic-native/calendar";

import { AuthService } from "../services/auth";
import { ConstantsService } from "../services/constants";
import { CustomerService } from "../services/customer";
import {ApplianceService} from "../services/appliance";
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { DispatcherPage } from "../pages/tabs/dispatcher/dispatcher";
import { SettingsPage } from "../pages/tabs/settings/settings";
import { SigninPage } from "../pages/signin/signin";
import { SignupPage } from "../pages/signup/signup";
import { CustomersListPage } from "../pages/tabs/field-work/customers-list/customers-list";
import { JobRangePage } from "../pages/tabs/field-work/customers-list/job-range/job-rage";
import { CustomerPage } from "../pages/tabs/field-work/customer/customer";
import { ContactinfoPage } from "../pages/tabs/field-work/customer/contactinfo/contactinfo";
import {DetailsPage} from "../pages/tabs/field-work/customer/details/details";
import {AddressPage} from "../pages/tabs/field-work/customer/address/address";
import {AppliancePage} from "../pages/tabs/field-work/customer/appliance/appliance";
import {EditAppliancePage} from "../pages/tabs/field-work/customer/edit_appliance/edit_appliance";
import {ImagesPage} from "../pages/tabs/field-work/customer/appliance/images/images";
import {Camera} from "@ionic-native/camera";
import {File} from "@ionic-native/file";
import {FileTransfer} from "@ionic-native/file-transfer";
import {FileTransferService} from "../services/file-transfer";
import {InvoicePage} from "../pages/tabs/field-work/customer/invoice/invoice";
import {GenerateInvoicePage} from "../pages/tabs/field-work/customer/generate_invoice/generate_invoice";
import {AppliancePartsPage} from "../pages/tabs/field-work/customer/generate_invoice/appliance_parts/appliance_parts";
import {CloseReviewPage} from "../pages/tabs/field-work/customer/close-review/close-review";
import {CloseAppliancePartsPage} from "../pages/tabs/field-work/customer/close-review/close_appliance_parts/close_appliance_parts";
import {UnfixAppliancePartsPage} from "../pages/tabs/field-work/customer/appliance/unfix-appliance-parts/unfix-appliance-parts";
import {TechnicianCustomerReassignPage} from "../pages/tabs/field-work/customer/reassign/reassign";
import {InvoiceAppliancePage} from "../pages/tabs/field-work/customer/invoice/invoice_appliance/invoice_appliance";
import {SharedFullCalendar} from "../pages/tabs/calendar/full_calendar";

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    DispatcherPage,
    SettingsPage,
    SigninPage,
    SignupPage,
    CustomersListPage,
    JobRangePage,
    CustomerPage,
    ContactinfoPage,
    DetailsPage,
    AddressPage,
    AppliancePage,
    EditAppliancePage,
    ImagesPage,
    InvoicePage,
    GenerateInvoicePage,
    AppliancePartsPage,
    CloseReviewPage,
    CloseAppliancePartsPage,
    UnfixAppliancePartsPage,
    TechnicianCustomerReassignPage,
    InvoiceAppliancePage,
    CalendarComponent,
    SharedFullCalendar
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyD8ZVfwLdNouD9by7b_xtV4eqoOMjL3nQM'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    DispatcherPage,
    SettingsPage,
    SigninPage,
    SignupPage,
    CustomersListPage,
    JobRangePage,
    CustomerPage,
    ContactinfoPage,
    DetailsPage,
    AddressPage,
    AppliancePage,
    EditAppliancePage,
    ImagesPage,
    InvoicePage,
    GenerateInvoicePage,
    AppliancePartsPage,
    CloseReviewPage,
    CloseAppliancePartsPage,
    UnfixAppliancePartsPage,
    TechnicianCustomerReassignPage,
    InvoiceAppliancePage,
    SharedFullCalendar
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    AuthService,
    ConstantsService,
    CustomerService,
    CallNumber,
    Geolocation,
    GoogleMapsAPIWrapper,
    ApplianceService,
    Camera,
    File,
    FileTransfer,
    FileTransferService,
    Calendar
  ]
})
export class AppModule {}
