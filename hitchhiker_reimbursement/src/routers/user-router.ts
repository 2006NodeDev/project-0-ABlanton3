import express, {Request, Response, NextFunction} from 'express'
//import {User} from '../models/User'
import {authenticationMiddleware} from '../middleware/authentication-middleware'
import {authorizationMiddleware} from '../middleware/authorization-middleware'
import { getAllUsers, getUserById, updateUser } from '../daos/user-dao'
import { User } from '../models/User'

export const userRouter = express.Router()

userRouter.use(authenticationMiddleware)


//get all users
userRouter.get('/', authorizationMiddleware(['admin', 'finance-manager']), async (req:Request,res:Response,next:NextFunction)=>{
        try{
            let allUsers = await getAllUsers()
            res.json(allUsers)
        } catch(e){
            next(e)
        }
})

//find user by ID number
userRouter.get('/:id', authorizationMiddleware(['admin', 'finance-manager'/*still not sure how to let user search themselves*/]), async (req:Request, res:Response, next: NextFunction)=>{//figure out how to do basically userId===userId
    let {id} = req.params
    if(isNaN(+id)){
        res.status(400).send('ID must be a number')
    } else {
        try {
            let user = await getUserById(+id)
            res.json(user)
        } catch (e) {
            next(e)
        }
    }
})

//update user
userRouter.patch('/',authorizationMiddleware(['admin']), async (req: Request, res:Response, next:NextFunction)=>{
    let { userId,
        username,
        password,
        firstName,
        lastName,
        email,
        role } = req.body
    if(!userId) { 
        res.status(400).send('Must have a User ID and at least one other field')
    }
    else if(isNaN(+userId)) { 
        res.status(400).send('ID must be a number')
    }
    else {
        let updatedUser:User = {
            userId,
            username,
            password,
            firstName,
            lastName,
            email,
            role
        }
        updatedUser.username = username || undefined
        updatedUser.password = password || undefined
        updatedUser.firstName = firstName || undefined
        updatedUser.lastName = lastName || undefined
        updatedUser.email = email || undefined
        updatedUser.role = role || undefined
        try {
            let result = await updateUser(updatedUser)
            res.json(result)
        } catch (e) {
            next(e)
        }
    }
}) 
