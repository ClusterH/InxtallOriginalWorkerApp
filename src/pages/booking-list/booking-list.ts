import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsProvider } from '../../providers/settings/settings';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/internal/operators';
import { Observable } from 'rxjs/Rx';
import { BookingDetailPage } from '../booking-detail/booking-detail';
import moment from 'moment';
import { Geolocation } from '@ionic-native/geolocation';

@IonicPage()
@Component({
  selector: 'page-booking-list',
  templateUrl: 'booking-list.html'
})
export class BookingListPage {
  items: any;
  userid = localStorage.getItem('user');
  newbookingData$: Observable<any[]>;
  pendingBookingData$: Observable<any[]>;
  completeBookingData$: Observable<any[]>;
  bookingType: any = 'new';
  intervalObj: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private setting: SettingsProvider,
    public afs: AngularFirestore,
    private geolocation: Geolocation
  ) {
    this.changeBookingType();
  }

  ionViewDidLoad() {}
  getNewBooking() {
    this.setting.startLoading();
    this.newbookingData$ = this.afs
      .collection('bookingMaster', ref =>
        ref
          .where('empId', 'array-contains', this.userid)
          .where('status', '==', 0)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        ),
        map(res =>
          res.map((r: any) => {
            r.user = this.afs.doc(`users/${r.userId}`).valueChanges();
            return r;
          })
        ),
        map(res =>
          res.map((r: any) => {
            r.addressData = this.afs
              .doc(`addressMaster/${r.address}`)
              .valueChanges();
            return r;
          })
        ),
        map(res =>
          res.sort((a: any, b: any) => {
            const aDate: any = moment(a.startTime, 'YYYY-MM-DD HH:mm');
            const bDate: any = moment(b.startTime, 'YYYY-MM-DD HH:mm');
            return aDate - bDate;
          })
        )
      );
    this.newbookingData$.subscribe(res => this.setting.stopLoading());
  }

  getActiveBoking() {
    this.setting.startLoading();
    this.pendingBookingData$ = this.afs
      .collection('bookingMaster', ref =>
        ref
          .where('empId', 'array-contains', this.userid)
          .where('status', '==', 1)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        ),
        map(res =>
          res.map((r: any) => {
            r.user = this.afs.doc(`users/${r.userId}`).valueChanges();
            return r;
          })
        ),
        map(res =>
          res.map((r: any) => {
            r.addressData = this.afs
              .doc(`addressMaster/${r.address}`)
              .valueChanges();
            return r;
          })
        ),
        map(res =>
          res.sort((a: any, b: any) => {
            const aDate: any = moment(a.startTime, 'YYYY-MM-DD HH:mm');
            const bDate: any = moment(b.startTime, 'YYYY-MM-DD HH:mm');
            return aDate - bDate;
          })
        )
      );

    this.pendingBookingData$.subscribe(res => {
      console.log(res);
      this.setting.stopLoading();
    });
  }
  getCompleteBoking() {
    this.setting.startLoading();
    this.completeBookingData$ = this.afs
      .collection('bookingMaster', ref =>
        ref
          .where('empId', 'array-contains', this.userid)
          .where('status', '==', 2)
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        ),
        map(res =>
          res.map((r: any) => {
            r.user = this.afs.doc(`users/${r.userId}`).valueChanges();
            return r;
          })
        ),
        map(res =>
          res.map((r: any) => {
            r.addressData = this.afs
              .doc(`addressMaster/${r.address}`)
              .valueChanges();
            return r;
          })
        ),
        map(res =>
          res.sort((a: any, b: any) => {
            const aDate: any = moment(a.startTime, 'YYYY-MM-DD HH:mm');
            const bDate: any = moment(b.startTime, 'YYYY-MM-DD HH:mm');
            return aDate - bDate;
          })
        )
      );

    this.completeBookingData$.subscribe(res => this.setting.stopLoading());
  }
  changeBookingType() {
    if (this.bookingType == 'new') {
      this.getNewBooking();
    } else if (this.bookingType == 'upcomming') {
      this.getActiveBoking();
    } else if (this.bookingType == 'complete') {
      this.getCompleteBoking();
    }
  }

  viewBookingDetail(id, e) {
    e.stopPropagation();
    clearInterval(this.intervalObj);
    this.navCtrl.push(BookingDetailPage, { id: id });
  }

  acceptBooking(data, e) {
    e.stopPropagation();
    if (data.status == 0) {
      this.setting.startLoading();
      this.afs
        .collection(`bookingMaster`)
        .doc(data.id)
        .update({
          AvailableEmpId: this.userid,
          status: 1
        })
        .then(res => {
          this.afs
            .collection(`notification`)
            .add({ id: data.userId, type: 1, bookingKey: data.id });
          this.setting.stopLoading();
          this.setting.presentToast('Request Accepted');
        })
        .catch(err => {
          this.setting.stopLoading();
          console.log(err);
        });
    } else {
      this.setting.presentToast('You Are a Late');
    }
  }

  onTheWayCall(data, e) {
    e.stopPropagation();
    this.setting.startLoading();
    this.afs
      .collection(`bookingMaster`)
      .doc(data.id)
      .update({
        onTheWay: 1
      })
      .then(res => {
        this.setting.stopLoading();
        this.setting.presentToast('Start On The Way');
        this.changeLocationDect();
        this.intervalObj = setInterval(() => {
          this.changeLocationDect();
        }, 60000);
      })
      .catch(err => {
        this.setting.stopLoading();
        console.log(err);
      });
  }

  employeeReach(data, e) {
    e.stopPropagation();

    this.setting.startLoading();
    this.afs
      .collection(`bookingMaster`)
      .doc(data.id)
      .update({
        onTheWay: 2
      })
      .then(res => {
        this.setting.stopLoading();
        this.setting.presentToast('Reach User Location');
        this.changeLocationDect();
        clearInterval(this.intervalObj);
      })
      .catch(err => {
        this.setting.stopLoading();
        console.log(err);
      });
  }

  changeLocationDect() {
    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        this.afs
          .collection(`users`)
          .doc(this.userid)
          .update({
            empCurrentLoc: resp.coords.latitude + ',' + resp.coords.longitude
          });
      })
      .catch(error => {
        console.log('Error getting location', error);
      });
  }

  completeBooking(data, e) {
    e.stopPropagation();
    if (data.status == 1) {
      this.setting.startLoading();
      this.afs
        .collection(`bookingMaster`)
        .doc(data.id)
        .update({
          status: 2,
          adminStatus: 1
        })
        .then(res => {
          this.setting.stopLoading();
          this.setting.presentToast('Compete Service');
          clearInterval(this.intervalObj);
        })
        .catch(err => {
          this.setting.stopLoading();
          console.log(err);
        });
    } else {
      this.setting.presentToast('You Are a Late');
    }
  }
}
