import { Request, Response, NextFunction } from "express";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";


export function authenticationMiddleware(req:Request, res:Response, next:NextFunction){
    if(!req.session.user) {
        throw new InvalidCredentialsError()
    } else{
        console.log(`user ${req.session.user.username} has a role of ${req.session.user.role}`);
        next()
    }
}