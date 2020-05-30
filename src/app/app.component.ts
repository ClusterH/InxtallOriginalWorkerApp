import {Component, ViewChild} from "@angular/core";
import {Nav, Platform} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SigninPage} from "../pages/signin/signin";
import {TabsPage} from "../pages/tabs/tabs";
import {FCM} from "@ionic-native/fcm";
import {BookingDetailPage} from "../pages/booking-detail/booking-detail";
@Component({
    templateUrl: "app.html"
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any = TabsPage;

    constructor(public platform: Platform,
                public statusBar: StatusBar,
                public splashScreen: SplashScreen,
                private fcm: FCM) {
        if (localStorage.getItem("user")) {
            this.rootPage = TabsPage;
        } else {
            this.rootPage = SigninPage;
        }

        this.initializeApp();

    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleLightContent();
            this.statusBar.backgroundColorByHexString('#404e67');
            this.splashScreen.hide();
        });

        this.fcm.onNotification().subscribe(
            data => {
                if (data.wasTapped) {
                    this.nav.push(BookingDetailPage, {id: data.bookingKey})
                } else {
                    //  Received in foreground
                }
            },
            err => {
                console.log("err", err);
            }
        );

    }

    openPage(page) {
        this.nav.setRoot(page.component);
    }
}
