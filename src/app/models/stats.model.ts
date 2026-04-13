
export interface QuestionStats{
 id:number
 type:'general'|'specific'
 attempts:number
 correct:number
 wrong:number
 lastAttempt?:number
}
