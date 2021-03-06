import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, Platform } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Storage } from '@ionic/storage';
import { TutorialPage } from '../tutorial/tutorial';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommondataProvider } from '../../providers/commondata/commondata';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  myForm: FormGroup;
  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public firebaseProvider : FirebaseProvider, public alertCtrl : AlertController, private storage: Storage,
    public fb: FormBuilder, public commondata: CommondataProvider, public loadingController: LoadingController,
    public platform: Platform, private _translate: TranslateService) {
      this.myForm = this.fb.group({
        user: ['', [Validators.required, Validators.minLength(5)]],
        email: ['', [Validators.required, Validators.email]],
        password1: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        password2: ['', [Validators.required]],
      },{
        validator: this.matchingPasswords('password1', 'password2')
      });
  }

  //Ejecuta una accion al abrirse la pantalla
  ionViewWillEnter() {
    this.platform.registerBackButtonAction(() => {this.navCtrl.pop()});
  }

  //Regitra al usuario
  goTo(email: string, password: string, usuario: string){
    this.loader();
    this.presentLoader();
    this.firebaseProvider.registerUser(email, password, usuario).then((user) => {
      this.firebaseProvider.Session.subscribe(session => this.commondata.sesionIniciada = session);
      this.storage.get('tutorialViewed').then(x => {
        if(x == false || x == undefined) {
          let destinationPage = this.navParams.get("pagina");
          this.loader();
          this.navCtrl.push(TutorialPage, {destinationPage});
        } else {
          this.loader();
          this.navCtrl.setRoot(this.navParams.get("pagina"));
        }
      })
    })
    .catch(err => {
      this._translate.get(['ALERTCONTROLLER.ERRORTITLE', 'ALERTCONTROLLER.OKBUTTON']).subscribe(translate => {
        let alert = this.alertCtrl.create({
          title: translate['ALERTCONTROLLER.ERRORTITLE'],
          subTitle: err.message,
          buttons: [translate['ALERTCONTROLLER.OKBUTTON']]
        });
        alert.present();
      })
    })
  }

  //Comprueba que las contraseñas sean iguales
  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];
      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  //Presenta el loader
  presentLoader() {
    this.loader();
    return this.loading.present();
  }

  //Para el loader
  stopLoader() {
    this.loading.dismissAll();
    this.loading = null;
  }

  //Presenta el loader o lo para si esta activo
  loader() {
    if (this.loading && this.loading.instance){
        this.stopLoader();
    }
    this._translate.get(['ALERTCONTROLLER.WAIT']).subscribe(translate => {
      this.loading = this.loadingController.create({
        content: translate['ALERTCONTROLLER.WAIT']
      })
    })
  }

}
 