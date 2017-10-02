/*
 * Created by Arsen Movsesyan on 10/1/17.
 */
import {Component, OnInit, ViewChild} from "@angular/core";
import {ActionSheetController, NavController} from "ionic-angular";
import {CalendarComponent} from "ap-angular2-fullcalendar";
import {CustomerService} from "../../../services/customer";
import {CustomerPage} from "../field-work/customer/customer";
import {CustomersListPage} from "../field-work/customers-list/customers-list";

@Component({
  selector: 'page-full-calendar',
  templateUrl: 'full_calendar.html'
})
export class SharedFullCalendar implements OnInit {
  private calendarOptions = {
    header: {
      left: 'prev,today,next',
      center: 'title',
      right: 'agendaCustomDay,agendaDay,listWeek'
    },
    views: {
      agendaCustomDay: {
        type: 'agenda',
        duration: {
          days: 4
        },
        buttonText: '4 days'
      }
    },
    events: [],
    eventClick: (calEvent) => {
      this.navCtrl.push(CustomerPage, {
        customer: calEvent.customer
      }).then();
    },
    defaultView: 'agendaCustomDay',
    timezone: 'local',
    selectable: true,
    displayEventTime: true,
    nowIndicator: true,
    firstDay: 0,
    businessHours: {
      start: '09:00',
      end: '18:00',
      dow: [1, 2, 3, 4, 5]
    },
    minTime: '06:00',
    maxTime: '22:00',
    aspectRatio: 2,
    allDaySlot: false,
    editable: true,
    height: 'auto'
  };
  @ViewChild(CalendarComponent) dispatcherCalendar: CalendarComponent;

  constructor(
      private actionSHeetCtrl: ActionSheetController,
      private navCtrl: NavController,
      private customerService: CustomerService
  ) {}

  ngOnInit() {
    const customers = this.customerService.retrieveLocalCustomers();
    for (const c of customers) {
      if (c.order_status === 1) {
        this.calendarOptions.events.push({
          title: c.address.mailing_address,
          start: c.current_assigned_start,
          end: c.current_assigned_end,
          editable: true,
          customer: c
        });
      }
    }
    this.dispatcherCalendar.fullCalendar('rerenderEvents', true);
    // this.calendar.createCalendar('MyCalendar')
    //     .then(
    //         (msg) => { console.log(msg); },
    //         (err) => { console.log(err); }
    //     );
  }

  onShowOptions() {
    const actionSheet = this.actionSHeetCtrl.create({
      title: 'Choose action',
      buttons: [
        {
          text: 'List View',
          handler: () => {
            this.navCtrl.parent.getByIndex(0).setRoot(CustomersListPage);
            // this.navCtrl.push(SharedFullCalendar);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present().then();
  }
}
