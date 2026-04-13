import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { Question } from '../models/question.model'
import { StorageService } from './storage.service'

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private general: Question[] = []
  private specific: Question[] = []

  constructor(private http: HttpClient,   private storage: StorageService) {}

  async load() {

    if (this.general.length && this.specific.length)
      return

    const generalStored = await this.storage.get('questions_general')
    const specificStored = await this.storage.get('questions_specific')

    if(generalStored && specificStored){

      this.general = generalStored.map((q: any) => ({
        ...q,
        type: 'General'
      }))

      this.specific = specificStored.map((q: any) => ({
        ...q,
        type: 'Especifico'
      }))

      return
    }

    const generalData = await firstValueFrom(
      this.http.get<Question[]>('assets/data/general.json')
    )

    const specificData = await firstValueFrom(
      this.http.get<Question[]>('assets/data/specific.json')
    )

    this.general = generalData.map(q => ({
      ...q,
      type: 'General'
    }))

    this.specific = specificData.map(q => ({
      ...q,
      type: 'Especifico'
    }))

    await this.storage.set('questions_general', this.general)
    await this.storage.set('questions_specific', this.specific)
  }

  async getGeneral(): Promise<Question[]> {

    await this.load()

    return this.general
  }

  async getSpecific(): Promise<Question[]> {

    await this.load()

    return this.specific
  }

  async getCombined(): Promise<Question[]> {

    await this.load()

    return [...this.general, ...this.specific]
  }

  reset(){
    this.general = []
    this.specific = []
  }

}