import {SigninPage} from './../signin/signin';
import {SettingsProvider} from './../../providers/settings/settings';
import {RestProvider} from './../../providers/rest/rest';
import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-forgot-password',
    templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
    email: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private rest: RestProvider, private setting: SettingsProvider) {
    }

    ionViewDidLoad() {}

    GoBack() {
        this.navCtrl.setRoot(SigninPage);
    }

    forgotPassword() {
        this.setting.startLoading();
        this.rest.resetPassword(this.email).then(res => {
            this.setting.stopLoading();
            if (res == true) {
                this.setting.presentToast('Check your email');
                this.email = '';
                this.navCtrl.setRoot(SigninPage);
            }
        }).catch(err => {
            this.setting.stopLoading();
            this.setting.presentToast(err.message);
        });
    }
}
