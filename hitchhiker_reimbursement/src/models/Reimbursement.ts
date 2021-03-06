
export class Reimbursement{
    reimbursementId: number // primary key
      author: number  // foreign key -> User, not null
      amount: number  // not null
    dateSubmitted: Date// not null
    dateResolved: Date //nullable
    description: string // not null
    resolver: number // foreign key -> User
    status: number // foreign key -> ReimbursementStatus
    type: number // foreign key -> ReimbursementType
  }