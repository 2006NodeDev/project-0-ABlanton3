import {HttpError} from "./HttpError";


export class AuthorizeError extends HttpError{
    constructor(){
        super(401, 'UNAUTHORIZED')
    }
}