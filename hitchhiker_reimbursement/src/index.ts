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


/*app.post('/login', (req:Request, res:Response)=>{
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
})*/

app.post('/login', async (req:Request, res:Response, next:NextFunction)=>{
    // you could use destructuring, see ./routers/book-router
    let username = req.body.username
    let password = req.body.password
    // if I didn't get a usrname/password send an error and say give me both fields
    if(!username || !password){
        // make a custom http error and throw it or just send a res
        throw new InvalidCredentialsError()
    } else {
        try{
            let user = await getUserByUsernameAndPassword(username, password)
            req.session.user = user// need to remeber to add their user data to the session
            // so we can use that data in other requests
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

app.listen(2006, () => {
    console.log("The server is running.");
})