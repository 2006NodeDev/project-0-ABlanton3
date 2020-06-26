import express, { Request, Response } from 'express'
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';
import { userRouter, users } from './routers/user-router';
import { sessionMiddleware } from './middleware/session-middleware';
import { loggingMiddleware } from './middleware/logging-middleware';

const app = express()

app.use(express.json)

app.use(loggingMiddleware)

app.use(sessionMiddleware)

app.use('/users', userRouter)

//do I want a reimbursements router?? something to ponder


app.post('/login',(req:Request, res:Response)=>{
    let {username, 
    password} = req.body
    
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

app.use((err, req, res, next) =>{
    if (err.statusCode){
        res.status(err.statusCode).send(err.message)
    }else{
        console.log(err)
        res.status(500).send('Something went wrong. Don\'t panic')
    }
})

app.listen(2006, () => {
    console.log("The server is running.");
    
})