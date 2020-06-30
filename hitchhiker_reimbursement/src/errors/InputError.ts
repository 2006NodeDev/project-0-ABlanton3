import {HttpError} from "./HttpError";

export class InputError extends HttpError{
    constructor(){
        super(400, 'Please fill out all fields')
    }
}