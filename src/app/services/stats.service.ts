import { Injectable } from '@angular/core'
import { StorageService } from './storage.service'

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private storage: StorageService) {}

  async recordAnswer(id:number,type:string,correct:boolean){

    let stats = await this.storage.get('stats') || {}

    const key = `${id}_${type}`

    if(!stats[key]){
      stats[key] = {
        id,
        type,
        attempts:0,
        correct:0,
        wrong:0,
        lastAttempt:null

      }
    }

    stats[key].attempts++
    stats[key].lastAttempt = new Date().toISOString()

    if(correct) stats[key].correct++
    else stats[key].wrong++

    await this.storage.set('stats',stats)

  }

  async getStats(): Promise<Record<string, any>>{
  return await this.storage.get('stats') || {}
}

  getRatio(stat:any){

    if(!stat) return 0

    const total = stat.correct + stat.wrong
    if(total === 0) return 0

    const ratio = stat.correct / total
    console.log(ratio)

    if(ratio > 0.9) return 1.5
    if(ratio > 0.75) return 1.2
    if(ratio > 0.5) return 1

    return 0

  }
}
