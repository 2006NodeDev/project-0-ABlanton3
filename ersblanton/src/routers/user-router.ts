import express, {Request, Response, NextFunction} from 'express'
import {User} from '../models/User'
import {authenticationMiddleware} from '../middleware/authentication-middleware'
import {authorizationMiddleware} from '../middleware/authorization-middleware'

export const userRouter = express.Router()

userRouter.use(authenticationMiddleware)// doesn't technically exist yet, going to work on next

//find users

userRouter.get('/', authorizationMiddleware(['admin']), (req:Request,res:Response,next:NextFunction)=>{
    res.json(users)
})

userRouter.get('/:id', authorizationMiddleware(['admin', 'finance-manager']), (req:Request, res:Response)=>{//figure out how to do basically userId===userId
    let {id} = req.params
    if(isNaN(+id)){
        // send a response telling them they need to give us a number
        res.status(400).send('Id needs to be a number')// the error way is better because it scales easier, fewer places you have to change code if you want to refactor
    } else {
        let found = false
        for(const user of users){
            if(user.userId === +id){
                res.json(user)// successfully foundthe user based on id
                found = true
            }
        }
        if(!found){
            res.status(404).send('User Not Found')//the id doesn't exist
        }
    }
})

export let users:User[] =[
    {
        userId: 1,
            username: 'admin123',
            password: 'password', //passwords should be stronger than this in a real situation
            firstName: 'Leia',
            lastName: 'Organa',
            email: 'prin.leia@alderann.com',
            role: {
                roleId: 1,
                role: `admin`
            }

    },
    {
        userId: 2,
        username: 'lcalrissian',
        password: 'password', //passwords should be stronger than this in a real situation
        firstName: 'Lando',
        lastName: 'Calrissian',
        email: 'general.calrissian@cloudcity.com',
        role: {
            roleId: 2,
            role: `finance-manager`
        }
    },
    {
        userId: 3,
        username: 'lukeskywlkr',
        password: 'password', //passwords should be stronger than this in a real situation
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'skywalker.luke@tatooine.com',
        role: {
            roleId: 3,
            role: `employee`
        }  
    },
    {
        userId: 4,
        username: 'nerf-herder',
        password: 'password', //passwords should be stronger than this in a real situation
        firstName: 'Han',
        lastName: 'Solo',
        email: 'millenniumfalcon@corellia.com',
        role: {
            roleId: 3,
            role: `employee`
        }  
    }
]