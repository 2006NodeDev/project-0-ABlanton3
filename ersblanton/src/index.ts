import express, { Request, Response } from 'express'
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';
import { userRouter, users } from './routers/user-router';


const app = express()//get completed app

app.use('/users', userRouter)

app.post('/login',(req:Request, res:Response)=>{
    let username = req.body.username
    let password = req.body.password

    if(!username || !password){
        throw new InvalidCredentialsError()
    } else {
        let found = false
        for(const user of users){
            if(user.username ===username && user.password === password){
                req.session.user = user
                res.json(user)
                found = true
            }
        }
        if(!found){
            throw new InvalidCredentialsError() //not sure if this is supposed to be the same as the one above.

        }
    }
})

app.listen(2006, () => {
    console.log("The server is running.");
    
})