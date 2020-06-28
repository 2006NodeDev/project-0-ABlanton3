import express, { Request, Response, NextFunction } from 'express'
import { InvalidCredentialsError } from './errors/InvalidCredentialsError';
import { userRouter } from './routers/user-router';
import { sessionMiddleware } from './middleware/session-middleware';
import { loggingMiddleware } from './middleware/logging-middleware';
import { getUserByUsernameAndPassword } from './daos/user-dao';
//import { authorizationMiddleware } from './middleware/authorization-middleware';

const app = express()

app.use(express.json)
app.use(loggingMiddleware)
app.use(sessionMiddleware)

app.use('/users', userRouter)

//do I want a reimbursements router?? something to ponder

                               
app.post('/login', async (req:Request, res:Response, next:NextFunction)=>{
    let username = req.body.username
    let password = req.body.password
    if(!username || !password){
        throw new InvalidCredentialsError()
    } else {
        try{
            let user = await getUserByUsernameAndPassword(username, password)
            req.session.user = user
            res.json(user)
        }catch(e){
            next(e)
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

app.listen(4242, () => {
    console.log("The server is running.");
})