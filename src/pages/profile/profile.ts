import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams, ActionSheetController, App} from "ionic-angular";
import {SettingsProvider} from "../../providers/settings/settings";
import {AngularFirestore} from "@angular/fire/firestore";
import {Camera} from "@ionic-native/camera";
import{RestProvider} from "../../providers/rest/rest";
import {SigninPage} from "../signin/signin";
@IonicPage()
@Component({
    selector: "page-profile",
    templateUrl: "profile.html"
})
export class ProfilePage {
    userid = localStorage.getItem("user");
    userData: any = {};
    imgProfile: string = 'http://placehold.it/90x90';
    imgUrl: any;
    imagecheck: boolean = false;
    at_location: any = false;
    at_shop: any = false;
    status: any = false;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private setting: SettingsProvider,
                public afs: AngularFirestore,
                public actionSheetCtrl: ActionSheetController,
                private camera: Camera,
                private rest: RestProvider,
                private app: App) {
        this.at_location = false;
        this.at_shop = false;
        this.status = false;
        this.setting.startLoading();
        this.afs.doc(`users/${this.userid}`).valueChanges().subscribe((res: any) => {
            this.setting.stopLoading();
            this.userData = res;
            this.imgProfile = res.image;
            if (res.at_outside == '0') {
                this.at_location = true;
            }
            if (res.at_shop == '0') {
                this.at_shop = true;
            }
            if (res.status == 'Active') {
                this.status = true;
            }
        }, err => {
            this.setting.stopLoading();
            console.log("err", err);
        });
    }

    ionViewDidLoad() {

    }

    changeImage() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Change Profile Picture',
            buttons: [
                {
                    text: 'Camera',
                    role: 'camera',
                    handler: () => {
                        this.openCamera();
                    }
                },
                {
                    text: 'Gallery',
                    role: 'gallery',
                    handler: () => {
                        this.openGallery();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        });

        actionSheet.present();
    }

    openCamera() {
        let cameraOptions = {
            destinationType: this.camera.DestinationType.DATA_URL,
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            encodingType: this.camera.EncodingType.JPEG,
            correctOrientation: true
        }

        this.camera.getPicture(cameraOptions).then((file_uri) => {
            this.imgProfile = 'data:image/jpg;base64,' + file_uri;
            this.imgUrl = file_uri;
            this.imagecheck = true;
        }, err => {
            console.log(err);
        });
    }

    openGallery() {
        let cameraOptions = {
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: this.camera.DestinationType.DATA_URL,
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            encodingType: this.camera.EncodingType.JPEG,
            correctOrientation: true
        }

        this.camera.getPicture(cameraOptions).then((file_uri) => {
            this.imagecheck = true;
            this.imgProfile = 'data:image/jpg;base64,' + file_uri;
            this.imgUrl = file_uri;
        }, err => {

        });
    }

    saveProfile() {
        if (this.at_location == true) {
            this.userData.at_outside = '0';
        } else {
            this.userData.at_outside = '1';
        }
        if (this.at_shop == true) {
            this.userData.at_shop = '0';
        } else {
            this.userData.at_shop = '1';
        }
        if (this.status == true) {
            this.userData.status = 'Active';
        } else {
            this.userData.status = 'Deactive';
        }
        this.setting.startLoading();
        this.afs.collection(`users`).doc(this.userid).update(this.userData).then(res => {
            this.setting.stopLoading();
            this.setting.presentToast("Profile update");
            if (this.imagecheck) {
                this.imageUpload(this.imgUrl);
            }
        }).catch(err => {
            this.setting.stopLoading();
            console.log(err);
        })
    }

    imageUpload(image) {
        const {task, ref} = this.rest.uploadImageToFirebase(image);
        task.subscribe(
            snapshot => {
                // this.imageUploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            }, error => alert('Some error occured while uploading the picture'),
            () => ref.getDownloadURL().subscribe(downloadUrl => {
                this.imagecheck = false;
                this.imgUrl = '';
                this.afs.collection(`users`).doc(this.userid).update({image: downloadUrl})
            })
        );
    }

    logout() {
        this.setting.stopLoading();
        this.rest.logout().then(res => {
            this.setting.stopLoading();
            if (res) {
                localStorage.removeItem('user');
                this.app.getRootNavs()[0].setRoot(SigninPage);
            }
        }).catch(err => {
            this.setting.stopLoading();
            this.setting.presentToast(err.message);
        })
    }
}
