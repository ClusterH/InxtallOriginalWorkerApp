import { PipesModule } from './../pipes/pipes.module';
import { DashboardPage } from './../pages/dashboard/dashboard';
import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SigninPage} from '../pages/signin/signin';
import {ProfilePage} from '../pages/profile/profile';
import {ForgotPasswordPage} from '../pages/forgot-password/forgot-password';
import {NativeGeocoder} from '@ionic-native/native-geocoder';
import {IonicSwipeAllModule} from 'ionic-swipe-all';
import {AnimationService, AnimatesDirective} from 'css-animator';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireModule} from '@angular/fire';
import {RestProvider} from '../providers/rest/rest';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {Geolocation} from '@ionic-native/geolocation';
import {SettingsProvider} from '../providers/settings/settings';
import {BookingListPage} from "../pages/booking-list/booking-list";
import {TabsPage} from "../pages/tabs/tabs";
import {BookingDetailPage} from "../pages/booking-detail/booking-detail";
import {FCM} from "@ionic-native/fcm";
import { Camera} from '@ionic-native/camera';
import { StarRatingModule } from 'ionic3-star-rating';
import {IonicImageViewerModule} from "ionic-img-viewer";

export const config = {
    apiKey: "AIzaSyBpSxDGSo3-UqkMy3_rsqxS01NxXz8ulRQ",
    authDomain: "carboy-b8b78.firebaseapp.com",
    databaseURL: "https://carboy-b8b78.firebaseio.com",
    projectId: "carboy-b8b78",
    storageBucket: "carboy-b8b78.appspot.com",
    messagingSenderId: "784277590732",
    appId: "1:784277590732:web:1c8e7abf7a928412512869",
    measurementId: "G-5D0T879FK0"
};

@NgModule({
    declarations: [
        MyApp,
        SigninPage,
        ProfilePage,
        ForgotPasswordPage,
        AnimatesDirective,
        BookingListPage,
        TabsPage,
        BookingDetailPage,
        DashboardPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicSwipeAllModule,
        AngularFireModule.initializeApp(config),
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularFireStorageModule,
        StarRatingModule,
        PipesModule,
        IonicImageViewerModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        SigninPage,
        ProfilePage,
        ForgotPasswordPage,
        BookingListPage,
        TabsPage,
        BookingDetailPage,
        DashboardPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        NativeGeocoder,
        AnimationService,
        RestProvider,
        Geolocation,
        SettingsProvider,
        FCM,
        Camera
    ]
})
export class AppModule {
}
