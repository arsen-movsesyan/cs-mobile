/*
 * Created by Arsen Movsesyan on 9/22/17.
 */
import {Component} from "@angular/core";
import * as moment from "moment";
import {AlertController, ViewController} from "ionic-angular";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'page-job-range',
  templateUrl: 'job-range.html'
})
export class JobRangePage {
  private customRange;

  constructor(
      private viewCtrl: ViewController,
      private alertCtrl: AlertController
  ) {
    this.customRange = moment().format('YYYY-MM-DD');
  }

  onSubmit(form: NgForm) {
    let valid = true;
    let errorMessage = '';
    let returnRange = {
      begin: moment().startOf('day'),
      end: moment().startOf('day'),
      title: 'Today'
    };
    let chosenRange = form.value;
    if (!chosenRange.range) {
      if (!chosenRange.customStart || !chosenRange.customEnd) {
        valid = false;
        errorMessage = 'No date range chosen.';
      } else {
        let cStart = moment(chosenRange.customStart);
        let cEnd = moment(chosenRange.customEnd);
        if (cStart > cEnd) {
          valid = false;
          errorMessage = 'Date wrong. Start time is greater that end!'
        } else {
          returnRange.begin = cStart.startOf('day');
          returnRange.end = cEnd.endOf('day');
          returnRange.title = 'Custom';
        }
      }
    } else {
      switch (chosenRange.range) {
        case 'today':
          returnRange.begin = moment().startOf('day');
          returnRange.end = moment().endOf('day');
          returnRange.title = 'Today';
          break;
        case 'week':
          returnRange.begin = moment().startOf('week');
          returnRange.end = moment().endOf('week');
          returnRange.title = 'Week';
          break;
        case 'overall':
          returnRange.begin = null;
          returnRange.end = null;
          returnRange.title = 'Overall';
          break;
      }
    }
    if (!valid) {
      const alert = this.alertCtrl.create({
        title: 'Wrong data chosen!',
        message: errorMessage,
        buttons: ['Close']
      });
      alert.present().then();
    } else {
      form.reset();
      this.viewCtrl.dismiss(returnRange).then();
    }
  }

  onCancel() {
    this.viewCtrl.dismiss().then();
  }
}