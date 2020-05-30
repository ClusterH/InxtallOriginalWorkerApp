import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {ForgotPasswordPage} from '../forgot-password/forgot-password';
import {AngularFirestore} from '@angular/fire/firestore';
import {RestProvider} from '../../providers/rest/rest';
import {SettingsProvider} from '../../providers/settings/settings';
import {TabsPage} from "../tabs/tabs";
import {FCM} from "@ionic-native/fcm";
declare var $: any;

@IonicPage()
@Component({
    selector: 'page-signin',
    templateUrl: 'signin.html',
})
export class SigninPage {
    email: any = '';
    password: any = '';

    constructor(public setting: SettingsProvider, public api: RestProvider, public afs: AngularFirestore, public navCtrl: NavController, public navParams: NavParams, private fcm: FCM) {
        $(".flp label").each(function () {
            var sop = '<span class="ch">'; //span opening
            var scl = '</span>'; //span closing
            $(this).html(sop + $(this).html().split("").join(scl + sop) + scl);
            $(".ch:contains(' ')").html("&nbsp;");
        })
        var d;
        $(".flp input").focus(function () {
            var tm = $(this).outerHeight() / 2 * -1 + "px";
            $(this).next().addClass("focussed").children().stop(true).each(function (i) {
                d = i * 50; //delay
                $(this).delay(d).animate({top: tm}, 200, 'easeOutBack');
            })
        })
        $(".flp input").blur(function () {
            if ($(this).val() == "") {

                $(this).next().removeClass("focussed").children().stop(true).each(function (i) {
                    d = i * 50;

                    $(this).delay(d).animate({top: 0}, 500, 'easeInOutBack');
                })
            }
        })
    }

    ionViewDidLoad() {

    }

    ionViewWillEnter() {
        $(".flp label").each(function () {
            var sop = '<span class="ch">'; //span opening
            var scl = '</span>'; //span closing
            $(this).html(sop + $(this).html().split("").join(scl + sop) + scl);
            $(".ch:contains(' ')").html("&nbsp;");
        })
        var d;
        $(".flp input").focus(function () {
            //calculate movement for .ch = half of input height
            var tm = $(this).outerHeight() / 2 * -1 + "px";
            $(this).next().addClass("focussed").children().stop(true).each(function (i) {
                d = i * 50; //delay
                $(this).delay(d).animate({top: tm}, 200, 'easeOutBack');
            })
        })
        $(".flp input").blur(function () {
            if ($(this).val() == "") {

                $(this).next().removeClass("focussed").children().stop(true).each(function (i) {
                    d = i * 50;

                    $(this).delay(d).animate({top: 0}, 500, 'easeInOutBack');
                })
            }
        })
    }

    signin() {
        this.setting.startLoading();
        this.api.login(this.email, this.password).then((data: any) => {
            this.afs.doc(`users/${data.user.uid}`).valueChanges().subscribe((res: any) => {
                this.setting.stopLoading();
                if (res.role == 2) {
                    localStorage.setItem('user', data.user.uid);
                    this.fcm.getToken().then(token => {
                        this.afs.collection(`users`).doc(data.user.uid).update({
                            token: token
                        });
                    });
                    this.navCtrl.setRoot(TabsPage);
                    this.setting.presentToast('Welcome to car wash :)');
                } else {
                    this.setting.presentToast('Pleade Check Your Role');
                }
            }, err => {
                this.setting.stopLoading();
            });
        }).catch(err => {
            this.setting.stopLoading();
            this.setting.presentToast(err.message);
        })
    }

    GoToForgot() {
        this.navCtrl.setRoot(ForgotPasswordPage)
    }

}
