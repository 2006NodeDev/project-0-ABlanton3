import { Request, Response, NextFunction } from "express";


export function authorizationMiddleware(roles:string[]){
    return (req:Request, res:Response, next:NextFunction) => {
        let allowed = false
        for(const role of roles){
            if(req.session.user.role === role){ //not sure why this is mad at me either. 
                allowed = true
                next()
            }
        }
        if(!allowed){
            res.status(401).send('The incoming token has expired')
        }
    }

}