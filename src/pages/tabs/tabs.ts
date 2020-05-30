import { DashboardPage } from './../dashboard/dashboard';
import {Component} from '@angular/core';
import {BookingListPage} from "../booking-list/booking-list";
import { ProfilePage } from '../profile/profile';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    tab1Root =  DashboardPage;
    tab2Root = BookingListPage;
    tab3Root = ProfilePage;


    constructor() {

    }
}
