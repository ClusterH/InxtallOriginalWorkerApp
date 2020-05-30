import {Injectable} from '@angular/core';
import {LoadingController, ToastController} from 'ionic-angular';

@Injectable()
export class SettingsProvider {
    toast: any
    loading2: any=null;

    constructor(public loadingCtrl: LoadingController, public toastCtrl: ToastController) {

    }

    presentToast(msg) {
        this.toast = this.toastCtrl.create({
            message: msg,
            duration: 2000,
            position: 'bottom'
        });
        this.toast.present();
    }

    dismissToast() {
        this.toast.onDidDismiss(() => {
        });
    }

    startLoading() {
      if(!this.loading2){
        this.loading2 = this.loadingCtrl.create({
            content: 'Please Wait...'
        });
        this.loading2.present()
      }
    }

    stopLoading() {
      if(this.loading2){
        this.loading2.dismiss();
        this.loading2 = null;
      }
    }
}
