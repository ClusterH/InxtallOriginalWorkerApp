import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireStorage} from "@angular/fire/storage";

@Injectable()
export class RestProvider {

    constructor(public afAuth: AngularFireAuth,private afStorage: AngularFireStorage) {

    }

    login(email, password) {
        return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    }

    register(email, password) {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    }

    uploadImageToFirebase(file) {
      const randomId = new Date().getTime() + Math.random().toString(36).substring(2);
      const ref = this.afStorage.ref(randomId+'.jpg');
      const task = ref.putString(file,'base64');
      return {
        task: task.snapshotChanges(),
        ref,
        path: randomId
      };
  }

  resetPassword(email){
    return new Promise((resolve, reject) => {
      this.afAuth.auth.sendPasswordResetEmail(email).then(res=>{
        resolve(true);
      }).catch(err=>{
        reject(err);
      })
    });
  }

  logout(){
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signOut().then(res=>{
        resolve(true);
      }).catch(err=>{
          reject(err);
      });
    });
  }

}
