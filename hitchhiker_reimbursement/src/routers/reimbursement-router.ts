import express, { Request, Response, NextFunction } from 'express'
import {findByStatus, getReimbursementByUser, submitReimbursement} from '../daos/reimbursement-dao'
import { Reimbursement } from '../models/Reimbursement'
import { InputError } from '../errors/InputError'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import {updateReimbursement} from '../daos/reimbursement-dao'

export const reimbursementRouter = express.Router()

//get reimbursement by status
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

//get reimbursement by user
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

//add new reimbursement
reimbursementRouter.post('/', authorizationMiddleware(['admin', 'finance-manager']), async (req:Request, res:Response, next:NextFunction) =>{
    console.log(req.body);
    let{author,
        amount,
        description,
        type} = req.body

    if(author && amount && description && type){
        let newReimbursement: Reimbursement = {
            reimbursementId: 0,
            author,
            amount,
            dateSubmitted: new Date(), //does not like the way I do dates :(
            dateResolved: null,
            description,
            resolver: null,
            status: 1,
            type
        }
        newReimbursement.type || null
        try{
            let savedReimbursement = await submitReimbursement(newReimbursement)
            res.json(savedReimbursement)
        } catch (e) {
            next(e)
        }
    } else{
        throw new InputError()
    }    
})

//update reimbursement
reimbursementRouter.patch('/', authorizationMiddleware(['admin', 'finance-manager']), async(req:Request, res:Response, next:NextFunction)=>{
    let { reimbursementId,
        author,
        amount,
        dateSubmitted,
        description,
        resolver,
        status,
        type} = req.body
    if(!reimbursementId || isNaN(reimbursementId)){
        res.status(400).send('Must have Reimbursement ID and at least one other field.')
    } else if(status === "Approved" || status === "Denied"){
        let updatedReimbursement = {
            reimbursementId,
            author,
            amount,
            dateSubmitted, 
            dateResolved: new Date(), 
            description,
            resolver,
            status,
            type
        } //there has to be a better way to do this bit, but I haven't a clue
        updatedReimbursement.author = author || undefined
        updatedReimbursement.amount = amount || undefined
        updatedReimbursement.description = description || undefined
        updatedReimbursement.resolver = resolver || undefined
        updatedReimbursement.status = status || undefined
        updatedReimbursement.type = type || undefined
        try{
            let results = await updateReimbursement(updatedReimbursement)
            res.json(results)
        } catch (e){
            next(e)
        }
    }
})