//type posibilities are `Lodging`, `Travel`, `Food`, or `Other`

export class ReimbursementType{
    typeId: number // primary key
    type: string // not null, unique
  }