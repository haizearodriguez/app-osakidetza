import { Injectable } from '@angular/core'
import { StorageService } from './storage.service'

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  used: any[] = []
  reviewQueue: any[] = []
  counter = 0

  constructor(private storage: StorageService) {}

  async next(pool:any[], trackUsed=true){

    this.counter++

    // repetir falladas cada 5 preguntas
    if(this.reviewQueue.length && this.counter % 5 === 0){
      return this.reviewQueue.shift()
    }

    if(!trackUsed){
      return pool[Math.floor(Math.random() * pool.length)]
    }

    const used = await this.storage.get('used') || []

    const unused = pool.filter(q =>
      !used.some((u:any) =>
        u.id === q.id && u.type === q.type
      )
    )

    if(unused.length === 0){
      return pool[Math.floor(Math.random() * pool.length)]
    }

    return unused[Math.floor(Math.random() * unused.length)]

  }

  async markUsed(id:number,type:string){

    let used = await this.storage.get('used') || []

    if(!used.some((u:any)=>u.id===id && u.type===type)){
      used.push({id,type})
      await this.storage.set('used',used)
    }

  }

  addToReview(question:any){
    this.reviewQueue.push(question)
  }

}