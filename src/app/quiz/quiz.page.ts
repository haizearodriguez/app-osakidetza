import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonLabel,
  IonCardContent
} from '@ionic/angular/standalone';

import { ActivatedRoute, Router } from '@angular/router';

import { QuestionService } from '../services/question.service';
import { QuizService } from '../services/quiz.service';
import { StatsService } from '../services/stats.service';
import { SelectedQuestion } from '../models/selectedQuestion.model';

import { addIcons } from 'ionicons';
import { arrowForward, arrowForwardCircle } from 'ionicons/icons';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonLabel,
    IonList,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    IonButton
  ]
})
export class QuizPage {

  question: any
  pool: any[] = []
  showAnswer = false

  index = 0
  answered = false
  selected = ''
  modeTitle = ''
  trackUsed = true
  totalQuestions = 0


  constructor(
    private qs: QuestionService,
    private quiz: QuizService,
    private route: ActivatedRoute,
    private router: Router,
    private statsService: StatsService
  ){
    addIcons({
      arrowForwardCircle,
      arrowForward
    });
  }

  async ionViewWillEnter() {

    const questions: SelectedQuestion[] = history.state?.questions || [];

    if (questions && questions.length > 0) {

      const all = await this.qs.getCombined();

      this.pool = all.filter(q =>
        questions.some(sel => sel.id === q.id && sel.type === q.type)
      );

      this.trackUsed = false
      this.modeTitle = "Quiz personalizado";

    } else {

      const mode = this.route.snapshot.queryParamMap.get('mode');

      if (mode === 'general'){
        this.pool = await this.qs.getGeneral()
        this.modeTitle = "Temario General"
      }

      else if (mode === 'specific'){
        this.pool = await this.qs.getSpecific()
        this.modeTitle = "Temario Específico"
      }

      else{
        this.pool = await this.qs.getCombined()
        this.modeTitle = "Temario Común"
      }
    }

    const stats = await this.statsService.getStats() as Record<string, any>
    /* mezcla ligera */
    this.pool = this.pool.sort(()=>Math.random()-0.5)

    /* ordenar por dificultad */
    this.pool = this.pool.sort((a,b)=>{

      const statA = stats[`${a.id}_${a.type}`]
      const statB = stats[`${b.id}_${b.type}`]

      console.log("STAT A", statA)
      
      const ratioA = this.statsService.getRatio(statA)
      const ratioB = this.statsService.getRatio(statB)

      return ratioA - ratioB

    })

    this.totalQuestions = this.pool.length
    this.index = 0

    this.load()
  }

  async load(){

    if(!this.trackUsed){
      // quiz personalizado
      this.question = this.pool[this.index]
    }

    else{

      /* PRIMERA RONDA */
      if(this.index < this.pool.length){
        this.question = this.pool[this.index]
      }

      /* DESPUÉS DE LA PRIMERA RONDA */
      else{
        this.question = await this.quiz.next(this.pool, true)
      }

    }

    this.answered = false
    this.selected = ''
    this.showAnswer = false

  }

  async select(option:string){

    if(this.answered) return

    this.selected = option
    this.answered = true

    const correct =
      option.toUpperCase() === this.question.correct?.toUpperCase()

    if(this.trackUsed){
      await this.quiz.markUsed(this.question.id, this.question.type)
    }

    if(!correct){
      this.quiz.addToReview(this.question)
    }

    await this.statsService.recordAnswer(
      this.question.id,
      this.question.type,
      correct
    )

  }

  next(){

    this.index++

    if(this.index >= this.totalQuestions){

      console.log("Quiz terminado")

      this.router.navigate(['/tabs/home'])
      return
    }

    this.load()

  }

  getButtonClass(opt:string){

    if(!this.answered && !this.showAnswer) return ''

    if(opt.toUpperCase() === this.question.correct?.toUpperCase())
      return 'correct'

    if(
      opt.toUpperCase() === this.selected?.toUpperCase() &&
      opt.toUpperCase() !== this.question.correct?.toUpperCase()
    )
      return 'wrong'

    return ''

  }

  verRespuesta(){

    if(this.answered) return

    this.showAnswer = true

  }

}