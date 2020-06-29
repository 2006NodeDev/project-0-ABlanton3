import {PoolClient } from "pg";
import {connectionPool} from ".";
import { ReimbursementDTOtoReimbursementConvertor } from "../utils/ReimbursementDTo-to-Reimbursement";
import { Reimbursement } from "../models/Reimbursement";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { ReimbursementNotFoundError } from "../errors/ReimbursementNotFound";

//find by status
export async function findByStatus(status:number):Promise<Reimbursement[]>{
    let client : PoolClient
    try {
        client = await connectionPool.connect()
        let results = await client.query(`select *
                                        from hitchhiker_reimbursement.reimbursements r left join hitchhiker_reimbursement.users u on r.author = u.user_id
                                        left join hitchhiker_reimbursement.reimbursement_statuses s on r.status = s.status_id
                                        left join hitchhiker_reimbursement.reimbursement_types t on r."type" = t.type_id
                                        where r.status = ${status}
                                        order by r.date_submitted;`)
        if(results.rowCount = 0){
        throw new Error('Reimbursement not found')
    }else {
        return results.rows.map(ReimbursementDTOtoReimbursementConvertor)
        }   
    } catch (e){
        if(e.message === 'Reimbursement not found'){
            throw new ReimbursementNotFoundError()
        }
        throw new Error('Something has gone wrong. Don\'t panic.')
    } finally{
        client && client.release()
    }
}

//get by user
export async function getReimbursementByUser(id: number):Promise<Reimbursement[]> { 
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results = await client.query(`select * from hitchhiker_reimbursement.reimbursements r 
                left join hitchhiker_reimbursement.users u on r.author = u.user_id
                left join hitchhiker_reimbursement.reimbursement_statuses s on r.status = s.status_id
                left join hitchhiker_reimbursement.reimbursement_types t on r."type" = t.type_id
                where r.author = ${id}
                order by date_submitted;`)
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return results.rows.map(ReimbursementDTOtoReimbursementConvertor)
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

//submit a new reimbursement
export async function newReimbursement(post){
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        client.query('begin')
        await client.query('insert into hitchhiker_reimbursement.reimbursements (author, amount, date_submitted, date_resolved, description, resolver, status_id, type_id) values ($1, $2, now(), $3, $4, $5, 2, 1, $5)',
            [post.author, post.amount, post.date_submitted, post.description, post.type])
        let result = await client.query('select * from hitchhiker_reimbursement.reimbursements where author $1 ORDER BY reimbursement_id desc limit 1 offset 0', [post.author])
        client.query('commit')
        return result.rows.map(ReimbursementDTOtoReimbursementConvertor)
    } catch(e){
        client.query('rollback')
        throw{
            status: 500,
            message: 'Internal Server Error'
        }
    }finally{
        client && client.release()
    }
}