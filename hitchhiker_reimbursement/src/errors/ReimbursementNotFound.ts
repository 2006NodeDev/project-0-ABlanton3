import { HttpError } from "./HttpError";

export class ReimbursementNotFoundError extends HttpError {
    constructor(){
        super(404, 'Reimbursement Not Found. Don\'t Panic.')
    }
}