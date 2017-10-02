/*
 * Created by Arsen Movsesyan on 9/21/17.
 */
import {EventEmitter, Injectable} from "@angular/core";
import {CustomerCloseModel, CustomerModel} from "../models/customer";
import {AuthService} from "./auth";
import {Observable} from "rxjs/Observable";
import 'rxjs/Rx';
import {Http, Response} from "@angular/http";
import {ConstantsService} from "./constants";
import {ApplianceCreateModel, ApplianceFixModel, ApplianceModel, ApplianceUnfixModel} from "../models/appliance";
import {InvoiceCreateModel, InvoiceModel} from "../models/invoice";
import {InvoiceApplianceModel} from "../models/invoice_appliance";
import {RequestedPartModel} from "../models/requested_part";
import {ApplianceService} from "./appliance";

@Injectable()
export class CustomerService {
  customers: CustomerModel[];
  applianceDeleted = new EventEmitter<number>();
  applianceUpdated = new EventEmitter<ApplianceModel>();
  invoiceCreated = new EventEmitter<InvoiceModel>();
  orderClosed = new EventEmitter<CustomerCloseModel>();
  applianceToggleFixed = new EventEmitter<{customerId: number, applianceId: number, fixed: boolean}>();
  partRequested = new EventEmitter<{part: RequestedPartModel, applianceId: number}>();
  // partCancelRequest = new EventEmitter<{applianceId: number, partId: number}>();
  partUninstall = new EventEmitter<{applianceId: number, partId: number}>();
  applianceFixed = new EventEmitter<ApplianceFixModel>();
  applianceUnfixed = new EventEmitter<ApplianceUnfixModel>();
  invoiceDeleted = new EventEmitter<{customerId: number, invoiceId: number}>();

  constructor(
      private authService: AuthService,
      private http: Http,
      private constants: ConstantsService,
      private applianceService: ApplianceService,
  ) {
    this._fetchCustomers()
        .subscribe(
            (customers: CustomerModel[]) => {
              this.customers = customers;
            }
        );
  }

  getAllCustomers(refresh=false) {
    if (refresh) {
      return this._fetchCustomers();
    }
    if (this.customers) {
      return Observable.of(this.customers);
    }
    return this._fetchCustomers();
  }

  retrieveLocalCustomers() {
    return this.customers;
  }

  reopenCustomer(customerId: number, restoreAppliances: boolean) {
    return this.http.put(
        this.constants.getBaseApiUrl() + '/customer/reopen/' + customerId + '/',
        {
          id: customerId,
          restore_appliances: restoreAppliances
        },
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json());
  }

  saveEmail(email: string, customerId: number) {
    const url = this.constants.getBaseApiUrl() + '/technician/customer/edit_email/' + customerId + '/';
    return this.http.put(url,
        {email: email},
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json().email)
        .do((newEmail: string) => {
          for (let c of this.customers) {
            if (c.id === customerId) {
              c.email = newEmail;
            }
          }
        });
  }

  addNewAppliance(newAppliance: ApplianceCreateModel, customerId: number) {
    return this.http.post(
        this.constants.getBaseApiUrl() + '/customer/' + customerId + '/appliance/',
        newAppliance,
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => {
          const acm = data.json();
          const newType = this.applianceService.getApplianceTypeById(acm.type);
          return new ApplianceModel(
              acm.id, newType, false, false, acm.model_number, acm.model_make, acm.serial_number,
              acm.problem_description, acm.detailed_problem_description, [], [], null, []
          );
        })
        .do((newApp: ApplianceModel) => {
          for (let c of this.customers) {
            if (c.id === customerId) {
              c.appliances.push(newApp);
            }
          }
        });
  }

  updateAppliance(oldAppliance: ApplianceCreateModel, customerId: number) {
    // console.log(appliance);
    return this.http.put(this.constants.getBaseApiUrl() + '/customer/' + customerId + '/appliance/' + oldAppliance.id + '/',
        oldAppliance,
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json())
        .do((newAppliance: ApplianceModel) => {
          for (let c of this.customers) {
            if (c.id === customerId) {
              for (let i = 0; i < c.appliances.length; i++) {
                if (c.appliances[i].id === newAppliance.id) {
                  c.appliances[i].model_number = newAppliance.model_number;
                  c.appliances[i].model_make = newAppliance.model_make;
                  c.appliances[i].serial_number = newAppliance.serial_number;
                  c.appliances[i].problem_description = newAppliance.problem_description;
                  c.appliances[i].detailed_problem_description = newAppliance.detailed_problem_description;
                  this.applianceUpdated.emit(c.appliances[i]);
                }
              }
            }
          }
        });
  }

  deleteAppliance(applianceId: number, customerId: number) {
    return this.http.delete(this.constants.getBaseApiUrl() + '/customer/' + customerId + '/appliance/' + applianceId + '/',
        {headers: this.authService.getAuthHeader()}
    )
        .map(() => {})
        .do(() => {
          for (let c of this.customers) {
            if (c.id === customerId) {
              const foundIndex = c.appliances.findIndex((app: ApplianceModel) => {
                return app.id === applianceId;
              });
              c.appliances.splice(foundIndex, 1);
              this.applianceDeleted.emit(applianceId);
            }
          }
        });
  }

  requestPart(requestedPart: string, applianceId: number) {
    return this.http.post(this.constants.getBaseApiUrl() + '/inventory/request_part/',
        {
          requested_part_number: requestedPart,
          appliance_id: applianceId
        },
        {headers: this.authService.getAuthHeader()}
    )
        .map((responseData: Response) => responseData.json())
        .do((newPart: RequestedPartModel) => {
          this.partRequested.emit({
            part: newPart,
            applianceId: applianceId
          });
        });
  }

  cancelRequest(partId: number, applianceId: number) {
    return this.http.post(this.constants.getBaseApiUrl() + '/inventory/request_part/cancel/',
        {
          part_id: partId,
          appliance_id: applianceId
        },
        {headers: this.authService.getAuthHeader()}
        )
        .map(() => {});
        // .do(() => {
        //   this.partCancelRequest.emit({
        //     partId: partId,
        //     applianceId: applianceId
        //   });
        // });
  }

  uninstallPart(partId: number, applianceId: number) {
    return this.http.post(this.constants.getBaseApiUrl() + '/inventory/request_part/uninstall/',
        {
          part_id: partId,
          appliance_id: applianceId
        },
        {headers: this.authService.getAuthHeader()}
        )
        .map(() => {})
        .do(() => {
          this.partUninstall.emit({
            partId: partId,
            applianceId: applianceId
          });
        });
  }

  generateInvoice(customerId: number, formValues: InvoiceCreateModel) {
    return this.http.post(this.constants.getBaseApiUrl() + '/customer/' + customerId + '/invoice/',
        formValues,
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json())
        .do((invoice: InvoiceCreateModel) => {
          let newInvoice = CustomerService._buildInvoiceModel(invoice);
          for (let c of this.customers) {
            if (c.id === customerId) {
              c.order_status = newInvoice.order_status;
              this.invoiceCreated.emit(newInvoice);
            }
          }
        });
  }

  closeOrder(closedCustomer: CustomerCloseModel) {
    // console.log(closedCustomer);
    return this.http.put(
        this.constants.getBaseApiUrl() + '/customer/close/' + closedCustomer.id + '/',
        closedCustomer,
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json())
        .do((customer: CustomerCloseModel) => {
          for (let c of this.customers) {
            if (c.id === customer.id) {
              c.order_status = customer.order_status;
              this.orderClosed.emit(customer);
            }
          }
        });
  }

  fixAppliance(customerId: number, oldAppliance: ApplianceFixModel) {
    return this.http.put(
        this.constants.getBaseApiUrl() + '/appliance/fix/' + oldAppliance.id + '/',
        oldAppliance,
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json())
        .do((newAppliance: ApplianceFixModel) => {
          this._toggleApplianceFix(customerId, newAppliance);
          this.applianceFixed.emit(newAppliance);
        });
  }

  unfixAppliance(customerId: number, oldAppliance: ApplianceUnfixModel) {
    return this.http.put(
        this.constants.getBaseApiUrl() + '/appliance/unfix/' + oldAppliance.id + '/',
        oldAppliance,
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json())
        .do((newAppliance: ApplianceUnfixModel) => {
          this._toggleApplianceFix(customerId, newAppliance);
          this.applianceUnfixed.emit(newAppliance);
        });

  }

  customerReassign(customerId: number, assignStart: string, assignEnd: string) {
    console.log(assignStart);
    console.log(assignEnd);
    return this.http.put(
        this.constants.getBaseApiUrl() + '/technician/customer/reassign/' + customerId + '/',
        {
          current_assigned_start: assignStart,
          current_assigned_end: assignEnd
        },
        {headers: this.authService.getAuthHeader()}
    )
        .map((data: Response) => data.json())
        .do((assignTime) => {
          console.log(assignTime);
        });
  }

  deleteInvoice(customerId: number, invoiceId: number, unfixAppliances: boolean) {
    return this.http.delete(
        this.constants.getBaseApiUrl() + '/customer/' + customerId + '/invoice/' + invoiceId + '/',
        {
          headers: this.authService.getAuthHeader(),
          body: {unfix_appliances: unfixAppliances}
        }
    )
        .map(() => {})
        .do(() => {
          this.invoiceDeleted.emit({
            customerId: customerId,
            invoiceId: invoiceId
          });
        });
  }

  sendInvoiceEmail(customerId: number, invoiceId: number, email: string) {
    return this.http.post(
        this.constants.getBaseApiUrl() + '/invoice/' + invoiceId + '/email_send/',
        {
          customer_email: email
        },
        {headers: this.authService.getAuthHeader()}
    )
        .map(() => {})
        .do(() => {});
  }

  private _fetchCustomers() {
    return this.http.get(this.constants.getBaseApiUrl() + '/customer/',
        {headers: this.authService.getAuthHeader()})
        .map((response: Response) => response.json().results);
  }

  private _toggleApplianceFix(customerId: number, newAppliance: any) {
    for (let c of this.customers) {
      if (c.id === customerId) {
        for (let a of c.appliances) {
          if (a.id === newAppliance.id) {
            a.fixed = newAppliance.fixed;
            this.applianceToggleFixed.emit({
              customerId: customerId,
              applianceId: newAppliance.id,
              fixed: newAppliance.fixed
            });
          }
        }
      }
    }
    // this.applianceFixed.emit(newAppliance);
  }

  private static _buildInvoiceModel(src: InvoiceCreateModel) {
    let invoiceAppliances: InvoiceApplianceModel[] = [];
    for (let a of src.map_appliances) {
      invoiceAppliances.push(new InvoiceApplianceModel(
          a.id, a.appliance, a.parts
      ));
    }
    return new InvoiceModel(
        src.id,
        src.labor_type,
        src.labor_type === 'service_fee' ? 'Service Fee' : 'Invoice',
        src.labor_price,
        src.tax_percent,
        src.decimal_tax_percent,
        src.payment_type,
        src.invoice_string,
        src.description,
        invoiceAppliances,
        false,
        null,
        src.order_status
    );
  }
}
