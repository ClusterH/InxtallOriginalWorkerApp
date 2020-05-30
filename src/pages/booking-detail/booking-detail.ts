import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  NativeGeocoder,
  NativeGeocoderForwardResult,
  NativeGeocoderOptions
} from '@ionic-native/native-geocoder';
import { AngularFirestore } from '@angular/fire/firestore';
import { SettingsProvider } from '../../providers/settings/settings';
import { BookingListPage } from '../booking-list/booking-list';
import { Geolocation } from '@ionic-native/geolocation';
declare var google;
@IonicPage()
@Component({
  selector: 'page-booking-detail',
  templateUrl: 'booking-detail.html'
})
export class BookingDetailPage {
  @ViewChild('map') mapElement: ElementRef;
  detailType: any = 'order_info';
  map: any;
  itemsCollection: any;
  bookingData: any;
  bookid: any;
  userid = localStorage.getItem('user');
  dirService = new google.maps.DirectionsService();
  dirRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
  distance: any;
  marchant: any;
  displayMap = false;
  options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  timer: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private nativeGeocoder: NativeGeocoder,
    public afs: AngularFirestore,
    private setting: SettingsProvider,
    private geolocation: Geolocation
  ) {
    this.bookid = this.navParams.get('id');

    this.setting.startLoading();
    this.itemsCollection = this.afs
      .collection(`bookingMaster`)
      .doc(this.bookid);
    this.itemsCollection.valueChanges().subscribe(
      res => {
        let hour = Math.floor(res.totalDuration / 60);
        let minute = res.totalDuration % 60;
        res.durationIhnHour = hour + ':' + minute;
        this.afs
          .collection(`users`)
          .doc(res.userId)
          .valueChanges()
          .subscribe(userRes => {
            res.user = userRes;
          });
        this.afs
          .collection(`addressMaster`)
          .doc(res.address)
          .valueChanges()
          .subscribe((addressRes: any) => {
            res.addressData = addressRes;
            this.nativeGeocoder
              .forwardGeocode(addressRes.Address, this.options)
              .then((coordinates: NativeGeocoderForwardResult[]) => {
                // console.log(
                //   'The coordinates are latitude=' +
                //     coordinates[0].latitude +
                //     ' and longitude=' +
                //     coordinates[0].longitude
                // );
                res.user_lat_long =
                  coordinates[0].latitude + ',' + coordinates[0].longitude;
              })
              .catch((error: any) => {
                this.setting.stopLoading();
                // console.log(error)
              });
          });

        this.afs
          .collection(`carMaster`)
          .doc(res.carId)
          .valueChanges()
          .subscribe(carRes => {
            res.carData = carRes;
          });

        this.afs
          .doc(`users/${res.marchantId}`)
          .valueChanges()
          .subscribe((merachant: any) => {
            this.marchant = merachant;
            this.getDistanceFromLatLonInKm();
          });

        let serviceData = [];
        res.services.forEach((serviceId: any, index) => {
          this.afs
            .doc(`service/${res.marchantId}/service/${serviceId}`)
            .valueChanges()
            .subscribe((service: any) => {
              service.id = serviceId;
              serviceData.push(service);
            });
        });
        res.servicesData = serviceData;
        this.bookingData = res;
        if (
          this.bookingData.status == 1 &&
          this.bookingData.UserWant == 'STAY' &&
          this.bookingData.onTheWay == 1
        ) {
          this.displayMap = true;
          this.changeLocationDect();
          let t = setInterval(() => {
            if (this.bookingData.onTheWay == 2) {
              clearInterval(t);
            } else {
              this.changeLocationDect();
            }
          }, 30000);
        }
        this.setting.stopLoading();
      },
      err => {
        this.setting.stopLoading();
      }
    );
  }

  ionViewDidLoad() {
    this.initMap();
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
        this.loadDirection(
          resp.coords.latitude + ',' + resp.coords.longitude,
          this.bookingData.user_lat_long
        );
      })
      .catch(error => {
        console.log('Error getting location', error);
      });
  }

  initMap() {
    let latLng = new google.maps.LatLng(22.3, 70.8);
    let mapoption = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapoption);
  }

  getDistanceFromLatLonInKm() {
    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        if (resp) {
          var R = 6371; // Radius of the earth in km
          var dLat = this.deg2rad(resp.coords.latitude - this.marchant.lat); // deg2rad below
          var dLon = this.deg2rad(resp.coords.longitude - this.marchant.lng);
          var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(this.marchant.lat)) *
              Math.cos(this.deg2rad(resp.coords.latitude)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var d = R * c; // Distance in km
          this.distance = Math.round(d);
        }
      })
      .catch(error => {
        console.log('Error getting location', error);
      });
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  loadDirection(a, b) {
    this.dirRenderer.setMap(this.map);
    var request = {
      origin: a,
      destination: b,
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.dirService.route(request, (result, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.dirRenderer.setDirections(result);
      }
    });
  }

  acceptBooking() {
    if (this.bookingData.status == 0) {
      this.setting.startLoading();
      this.afs
        .collection(`bookingMaster`)
        .doc(this.bookid)
        .update({
          AvailableEmpId: this.userid,
          status: 1
        })
        .then(res => {
          this.afs.collection(`notification`).add({
            id: this.bookingData.userId,
            type: 1,
            bookingKey: this.bookid
          });
          this.setting.stopLoading();
          this.setting.presentToast('Request Accepted');
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      this.setting.presentToast('You Are a Late');
    }
  }

  onTheWayCall() {
    this.setting.startLoading();
    this.afs
      .collection(`bookingMaster`)
      .doc(this.bookid)
      .update({
        onTheWay: 1
      })
      .then(res => {
        this.setting.stopLoading();
        this.displayMap = true;
        this.setting.presentToast('Start On The Way');
        this.changeLocationDect();
        this.timer = setInterval(() => {
          this.changeLocationDect();
        }, 60000);
      })
      .catch(err => {
        this.setting.stopLoading();
        console.log(err);
      });
  }

  employeeReach() {
    this.setting.startLoading();
    this.afs
      .collection(`bookingMaster`)
      .doc(this.bookid)
      .update({
        onTheWay: 2
      })
      .then(res => {
        this.setting.stopLoading();
        this.displayMap = false;
        this.setting.presentToast('Reach User Location');
        clearInterval(this.timer);
      })
      .catch(err => {
        this.setting.stopLoading();
        console.log(err);
      });
  }

  completeBooking() {
    if (this.bookingData.status == 1) {
      this.setting.startLoading();
      this.afs
        .collection(`bookingMaster`)
        .doc(this.bookid)
        .update({
          status: 2,
          adminStatus: 1
        })
        .then(res => {
          this.setting.stopLoading();
          this.setting.presentToast('Compete Service');
        })
        .catch(err => {
          this.setting.stopLoading();
          console.log(err);
        });
    } else {
      this.setting.presentToast('You Are a Late');
    }
  }

  rejectBooking() {
    this.navCtrl.setRoot(BookingListPage);
  }

  cancelBooking() {
    if (this.bookingData.status == 1) {
      this.setting.startLoading();
      this.afs
        .collection(`bookingMaster`)
        .doc(this.bookid)
        .update({
          status: 3
        })
        .then(res => {
          this.setting.stopLoading();
          this.setting.presentToast('Cancel Service');
          this.navCtrl.setRoot(BookingListPage);
        })
        .catch(err => {
          this.setting.stopLoading();
          console.log(err);
        });
    } else {
      this.setting.presentToast('You Are Not Able to Change');
    }
  }
}
