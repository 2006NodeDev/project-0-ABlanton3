import {HttpError} from "./HttpError";


export class InvalidCredentialsError extends HttpError{
    constructor(){
        super(400, 'Invalid Credentials')
    }
}
