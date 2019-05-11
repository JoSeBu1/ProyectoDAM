import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, Platform, Events } from 'ionic-angular';
import { VervueloPage } from '../vervuelo/vervuelo';
import { AnyadirvueloPage } from '../anyadirvuelo/anyadirvuelo';
import { EditarvueloPage } from '../editarvuelo/editarvuelo';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Storage } from '@ionic/storage';
import { CommondataProvider } from '../../providers/commondata/commondata';

interface Vuelo {
  baterias: string;
  distancia: string;
  lugar: string;
  fecha: any;
  condicionesAtmosfericas: string;
  video: string;
  id?: string;
}

@Component({
  selector: 'page-vuelos',
  templateUrl: 'vuelos.html',
})
export class VuelosPage {

  vuelosCollection: AngularFirestoreCollection<Vuelo>;
  vuelo: Vuelo[];
  public counter = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, private angularFirestore: AngularFirestore,
    private storage: Storage, public commondata: CommondataProvider, public alertController: AlertController,
    public toastCtrl: ToastController, private platform: Platform, private events: Events) {
      this.events.subscribe('dronChanged', (data) => {
        this.ionViewDidEnter();
      });
  }

  ionViewDidEnter() {
    this.storage.get('UID').then( x =>  {
      this.vuelosCollection = this.angularFirestore.collection('usuarios/' + x + '/drones/' + this.commondata.dronActivo.id +'/vuelos');
      console.log('usuarios/' + x + '/drones/' + this.commondata.dronActivo.id +'/vuelos');
      this.vuelosCollection.snapshotChanges().subscribe(vueloList => {
        this.vuelo = vueloList.map(item => {
          return {
            baterias: item.payload.doc.data().baterias,
            distancia: item.payload.doc.data().distancia,
            lugar: item.payload.doc.data().lugar,
            fecha: item.payload.doc.data().fecha,
            condicionesAtmosfericas: item.payload.doc.data().condicionesAtmosfericas,
            video: item.payload.doc.data().video,
            id: item.payload.doc.id
          }
        });
      });
    });
  }

  ionViewWillEnter() {
    this.platform.registerBackButtonAction(() => {
      if (this.counter == 0) {
        this.counter++;
        this.presentToast();
        setTimeout(() => { this.counter = 0 }, 2000)
      } else {
        this.platform.exitApp();
      }
    }, 0)
  }

  goToFly(item) {
    this.navCtrl.push(VervueloPage, {item});
  }

  goToEditFly(item) {
    this.navCtrl.push(EditarvueloPage, {item});
  }

  goToDeleteFly(item: Vuelo) {
    const alert = this.alertController.create({
      title: 'Se necesita confirmación!',
      message: '¿Estás seguro que quieres eliminar el vuelo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //Cancela
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.storage.get('UID').then( x =>  {
              this.angularFirestore.doc(`usuarios/${x}/drones/${this.commondata.dronActivo.id}/vuelos/${item.id}`).delete();
            })
          }
        }
      ]
    });
    alert.present();
  }

  goToAddFly() {
    this.navCtrl.push(AnyadirvueloPage);
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: "Presiona otra vez para salir de la aplicación",
      duration: 2000,
      position: "bottom"
    });
    toast.present();
  }

}
