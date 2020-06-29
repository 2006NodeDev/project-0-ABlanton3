import {PoolClient } from "pg";
import {connectionPool} from ".";
import { ReimbursementDTOtoReimbursementConvertor } from "../utils/ReimbursementDTo-to-Reimbursement";
import { Reimbursement } from "../models/Reimbursement";
import { UserNotFoundError } from "../errors/UserNotFoundError";

//find by status

export async function findByStatus(status: number):Promise<Reimbursement>{
    let client : PoolClient
    try {
        client = await connectionPool.connect()
        let results = await client.query(`select r.reimbursement_id, 
                                        r.author , 
                                        r.amount ,
                                        r.date_submitted,
                                        r.date_resolved, 
                                        r.description ,
                                        r.resolver , 
                                        r.status,
                                        r.type
                                        from hitchhiker_reimbursement.reimbursements r left join hitchhiker_reimbursement.usersr u on r.author = u.user_id
                                        left join hitchhiker_reimbursement s on r.status = s.status_id
                                        left join hitchhiker_reimbursement t on r.types = t.type_id
                                        where r.status = $1;
                                        order by r.date_submitted`,
                                        [status])
        if(results.rowCount = 0){
        throw new Error('Reimbursement not found')
    }
    
    return ReimbursementDTOtoReimbursementConvertor(results.rows[0]) //this doesn't feel right
    } catch (e){
        throw new Error('Something has gone wrong. Don\'t panic.')
    } finally{
        client && client.release()
    }
}


export async function getReimbursementByUser(id: number):Promise<Reimbursement> { 
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results = await client.query(`select r.reimbursement_id, 
                r.author , 
                r.amount ,
                r.date_submitted,
                r.date_resolved, 
                r.description ,
                r.resolver , 
                r.status,
                r.type
                from hitchhiker_reimbursement.reimbursements r left join hitchhiker_reimbursement.usersr u on r.author = u.user_id
                left join hitchhiker_reimbursement s on r.status = s.status_id
                left joun hitchhiker_reimbursement t on r.types = t.type_id
                where r.author = $1;
                order by date_submitted`,
            [id])
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return ReimbursementDTOtoReimbursementConvertor(results.rows[0]) //This might only give me one row, so that's not ideal.
    } catch (e) {
        if(e.message === 'User Not Found'){
            throw new UserNotFoundError()
        } 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
}