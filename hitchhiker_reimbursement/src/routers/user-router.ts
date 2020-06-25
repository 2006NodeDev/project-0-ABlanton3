import express, {Request, Response, NextFunction} from 'express'
import {User} from '../models/User'
import {authenticationMiddleware} from '../middleware/authentication-middleware'
import {authorizationMiddleware} from '../middleware/authorization-middleware'

export const userRouter = express.Router()

userRouter.use(authenticationMiddleware)

//find users

userRouter.get('/', authorizationMiddleware(['admin']), (req:Request,res:Response,next:NextFunction)=>{
    res.json(users)
})

//find user by ID number
userRouter.get('/:id', authorizationMiddleware(['admin', 'finance-manager']), (req:Request, res:Response)=>{//figure out how to do basically userId===userId
    let {id} = req.params
    if(isNaN(+id)){
        res.status(400).send('ID must be a number')
    } else {
        let found = false
        for(const user of users){
            if(user.userId === +id){
                res.json(user)
                found = true
            }
        }
        if(!found){
            res.status(404).send('User Not Found')
        }
    }
})

//update user
userRouter.patch('/', authorizationMiddleware(['admin']), authenticationMiddleware, (req: Request, res:Response)=>{
    const user = users.find(val => val.userId === Number(req.params.id));
    user.username = req.body.name;
    return res.json({message: "Updated"})
})

//to be replaced later with a real database
export let users:User[] =[
    {
        userId: 1,
            username: 'admin123',
            password: 'password', //passwords should be stronger than this in a real situation
            firstName: 'Arthur',
            lastName: 'Dent',
            email: 'dent.arthur@earth.com',
            role: {
                roleId: 1,
                role: `admin`
            }

    },
    {
        userId: 2,
        username: 'improbable.tricia',
        password: 'password', //passwords should be stronger than this in a real situation
        firstName: 'Trillian',
        lastName: 'Astra',
        email: 't.astra@earth.com',
        role: {
            roleId: 2,
            role: `finance-manager`
        }
    },
    {
        userId: 3,
        username: 'frdprfct',
        password: 'password', //passwords should be stronger than this in a real situation
        firstName: 'Ford',
        lastName: 'Prefect',
        email: 'ford.prefect@betelgeuseV.com',
        role: {
            roleId: 3,
            role: `employee`
        }  
    },
    {
        userId: 4,
        username: 'presidentZ',
        password: 'password', //passwords should be stronger than this in a real situation
        firstName: 'Zaphod',
        lastName: 'Beeblebrox',
        email: 'president.beeblebrox@betelgeuseV.com',
        role: {
            roleId: 3,
            role: `employee`
        }  
    }
]