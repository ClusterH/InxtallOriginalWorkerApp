import {SettingsProvider} from './../../providers/settings/settings';
import {map} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';
import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {Observable} from "rxjs/Rx";

@IonicPage()
@Component({
    selector: 'page-dashboard',
    templateUrl: 'dashboard.html',
})
export class DashboardPage {
    reviewData$: Observable<any[]>;
    userid = localStorage.getItem('user');
    todayPending: any;
    todayComplete: any;
    weekPending: any;
    weekComplete: any;
    todayPendingEarning: any;
    todayCompleteEarning: number;
    weekPendingEarning: any;
    weekCompleteEarning: number;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public afs: AngularFirestore,
                private setting: SettingsProvider) {
        this.getReview();
        let start: string = moment().startOf('day').format('YYYY-MM-DD HH:mm');
        let end: string = moment().endOf('day').format('YYYY-MM-DD HH:mm');
        let weekStart: string = moment().startOf('week').add(1, 'd').format('YYYY-MM-DD HH:mm');
        let weekEnd: string = moment().endOf('week').add(1, 'd').format('YYYY-MM-DD HH:mm');
        this.afs.collection('bookingMaster', ref => ref.where('AvailableEmpId', '==', this.userid).where('status', '==', 1).where('startTime', '>=', start).where('startTime', '<=', end)).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data: any = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
            }))).subscribe(res => {
            this.todayPendingEarning = 0;
            res.forEach((data: any) => {
                this.todayPendingEarning = this.todayPendingEarning + data.total;
            })
            this.todayPending = res.length;
        })

        this.afs.collection('bookingMaster', ref => ref.where('AvailableEmpId', '==', this.userid).where('status', '==', 2).where('startTime', '>=', start).where('startTime', '<=', end)).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data: any = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
            }))).subscribe(res => {
            this.todayCompleteEarning = 0;
            res.forEach((data: any) => {
                this.todayCompleteEarning = this.todayCompleteEarning + data.total;
            })
            this.todayComplete = res.length;
        })

        this.afs.collection('bookingMaster', ref => ref.where('AvailableEmpId', '==', this.userid).where('status', '==', 1).where('startTime', '>=', weekStart).where('startTime', '<=', weekEnd)).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data: any = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
            }))).subscribe(res => {
            this.weekPendingEarning = 0;
            res.forEach((data: any) => {
                this.weekPendingEarning = this.weekPendingEarning + data.total;
            })
            this.weekPending = res.length;
        })

        this.afs.collection('bookingMaster', ref => ref.where('AvailableEmpId', '==', this.userid).where('status', '==', 2).where('startTime', '>=', weekStart).where('startTime', '<=', weekEnd)).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data: any = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
            }))).subscribe(res => {
            this.weekCompleteEarning = 0;
            res.forEach((data: any) => {
                this.weekCompleteEarning = this.weekCompleteEarning + data.total;
            })
            this.weekComplete = res.length;
        })
    }

    ionViewDidLoad() {}

    getReview() {
        this.setting.startLoading();
        this.reviewData$ = this.afs.collection('ratingMaster', ref => ref.where('employeeId', '==', this.userid)).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
            })), map(res => res.map((r: any) => {
                r.user = this.afs.doc(`users/${r.userId}`).valueChanges();
                return r;
            })), map(res => res.sort((a: any, b: any) => {
                const aDate: any = moment(a.create_date, 'YYYY-MM-DD HH:mm');
                const bDate: any = moment(b.create_date, 'YYYY-MM-DD HH:mm');
                return aDate - bDate;
            })));

        this.reviewData$.subscribe(res => this.setting.stopLoading());
    }


}
