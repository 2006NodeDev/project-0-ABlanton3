import express, { Request, Response, NextFunction } from 'express'
import {findByStatus, getReimbursementByUser} from '../daos/reimburement-dao'

export let reimbursementRouter = express.Router()


reimbursementRouter.get('/:status', async (req: Request, res: Response, next:NextFunction) => {
    let { status } = req.params
    if (isNaN(+status)) {
        next(new Error('Status ID must be a number'))
    } else {
        try {
            let reimbursement = await findByStatus(+status)
            res.json(reimbursement)
        } catch(e){
            next(e)
        }
    }
})

reimbursementRouter.get('/:id', async (req: Request, res: Response, next:NextFunction) => {
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