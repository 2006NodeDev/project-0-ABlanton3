import express, {Request, Response, NextFunction} from 'express'
//import {User} from '../models/User'
import {authenticationMiddleware} from '../middleware/authentication-middleware'
import {authorizationMiddleware} from '../middleware/authorization-middleware'
import { getAllUsers, getUserById, updateUser } from '../daos/user-dao'

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
userRouter.get('/:id', authorizationMiddleware(['admin', 'finance-manager']), async (req:Request, res:Response, next: NextFunction)=>{//figure out how to do basically userId===userId
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
userRouter.patch('/',authorizationMiddleware(['admin']), async (req: Request, res:Response)=>{
    try {
        const {body} = req;
        const update = await updateUser(body);
        res.status(200).json(update);
    } catch (e) {
        res.status(e.status).send(e.message);
    }
})

