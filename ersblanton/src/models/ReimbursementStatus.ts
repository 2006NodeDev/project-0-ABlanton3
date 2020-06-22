// status possibilities are 'Pending', 'Approved', or 'Denied'

export class ReimbursementStatus{
    statusId: number // primary key
    status: string // not null, unique
  }