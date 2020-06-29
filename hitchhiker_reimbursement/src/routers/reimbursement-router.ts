import express, { Request, Response, NextFunction } from 'express'
import {findByStatus, getReimbursementByUser} from '../daos/reimbursement-dao'

export const reimbursementRouter = express.Router()


reimbursementRouter.get('/status/:statusId', async (req: Request, res: Response, next:NextFunction) => {
    let {statusId} = req.params
    if (isNaN(+statusId)) {
        next(new Error('Status ID must be a number'))
    } else {
        try {
            let reimbursement = await findByStatus(+statusId)
            res.json(reimbursement)
        } catch(e){
            next(e)
        }
    }
})

reimbursementRouter.get('/author/userId/:id', async (req: Request, res: Response, next:NextFunction) => {
    let { id } = req.params
    if (isNaN(+id)) {
        next(new Error('User ID must be a number'))
    } else {
        try {
            let reimbursement = await getReimbursementByUser(+id)
            res.json(reimbursement)
        } catch(e){
            next(e)
        }
    }
})

