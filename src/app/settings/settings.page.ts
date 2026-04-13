import { QuestionService } from './../services/question.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';

import {
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle, IonText, IonIcon } from '@ionic/angular/standalone';

import { StorageService } from 'src/app/services/storage.service';
import { addIcons } from 'ionicons';
import { pencil } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
  ]
})
export class SettingsPage implements OnInit {

  general:any[] = [];
  generalKeys:number[] = [];

  specific:any[] = [];
  specificKeys:number[] = [];

  selectedGeneralQuestion:number | null = null;
  selectedGeneralAnswer:string | null = null;

  selectedSpecificQuestion:number | null = null;
  selectedSpecificAnswer:string | null = null;

  @ViewChild('answerSelect') answerSelect!: IonSelect;

  constructor(private storage:StorageService, private alertController : AlertController, private QuestionService : QuestionService) {
    addIcons({
          pencil
        });
  }

  async ngOnInit(){

    this.general = await this.storage.get('questions_general');
    this.specific = await this.storage.get('questions_specific');

    this.generalKeys = this.general.map(q => q.id);
    this.specificKeys = this.specific.map(q => q.id);
  }

  onGeneralQuestionChange(){

    const q = this.general.find(
      x => x.id === this.selectedGeneralQuestion
    );

    if(q){
      this.selectedGeneralAnswer = q.correct;
    }

  }

  onSpecificQuestionChange(){

    const q = this.specific.find(
      x => x.id === this.selectedSpecificQuestion
    );

    if(q){
      this.selectedSpecificAnswer = q.correct;
    }

  }


  async updateGeneral(){

    const q = this.general.find(
      x => x.id === this.selectedGeneralQuestion
    );

    if(q){
      q.correct = this.selectedGeneralAnswer;
    }

    await this.storage.set('questions_general', this.general);
    this.QuestionService.reset()

  }

    async updateSpecific(){

    const q = this.specific.find(
      x => x.id === this.selectedSpecificQuestion
    );

    if(q){
      q.correct = this.selectedSpecificAnswer;
    }

    await this.storage.set('questions_specific', this.specific);
    this.QuestionService.reset()

  }

  async clear(){

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Borrar estadísticas?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: async () => {
            await this.storage.remove('used'),
            await this.storage.remove('stats')
          }
        }
      ]
    })

    await alert.present()
  }

}
