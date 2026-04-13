import { Component, OnInit } from '@angular/core'
import { StatsService } from 'src/app/services/stats.service'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCheckbox,
  IonButton, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [IonCard, 
    CommonModule,
    FormsModule,
    IonContent,
    IonRow,
    IonGrid,
    IonCol,
    IonCheckbox,
    IonButton
  ]

})
export class StatsPage implements OnInit {

  stats:any[] = []

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private statsService:StatsService, private router : Router,   private alertController: AlertController
){}

  async ngOnInit(){
    await this.loadStats()
  }

  async ionViewWillEnter(){
    await this.loadStats()
  }

  async loadStats(){

    const statsObj = await this.statsService.getStats()
    const data:any[] = Object.values(statsObj)
    
    this.stats=data.map(s=>({
    ...s,
    selected:false
    }))

    this.stats=[...this.stats]

    }


  accuracy(s:any){
    if(!s.attempts) return 0
    return Math.round((s.correct / s.attempts) * 100)
  }

  async generateQuiz() {

    const selected = this.stats
      .filter(s => s.selected)
      .map(s => ({ id: s.id, type: s.type }));


    if (selected.length === 0) {
      const alert = await this.alertController.create({
        header: 'Aviso',
        message: 'Selecciona al menos una pregunta',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

    console.log("IDS enviados:", selected);

    this.router.navigate(['/tabs/quiz'], {
      state: { questions: selected }
    });
  }

  sort(column: string) {

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.stats.sort((a, b) => {

      let valueA: any;
      let valueB: any;

      if (column === 'accuracy') {
        valueA = this.accuracy(a);
        valueB = this.accuracy(b);
      } else {
        valueA = a[column];
        valueB = b[column];
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;

    });

  }

  getSortIcon(column: string) {

    if (this.sortColumn !== column) return '';

    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

}