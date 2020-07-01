import {PoolClient } from "pg";
import {connectionPool} from ".";
import { ReimbursementDTOtoReimbursementConvertor } from "../utils/ReimbursementDTO-to-Reimbursement";
import { Reimbursement } from "../models/Reimbursement";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { ReimbursementNotFoundError } from "../errors/ReimbursementNotFound";
import { InputError } from "../errors/InputError";

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
export async function submitReimbursement(newReimbursement:Reimbursement):Promise<Reimbursement>{
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;')
        let reimbursementType = await client.query(`select t.type_id from hitchhiker_reimbursement.reimbursement_types t where t.type_id = $1;`, [newReimbursement.type])
        if(reimbursementType.rowCount === 0){
            throw new Error('Type Not Found')
        }
        reimbursementType = reimbursementType.rows[0].type_id
        let results = await client.query(`insert into hitchhiker_reimbursement.reimbursements ("author", "amount","date_submitted","description", "type") values($1, $2, $3, $4, $5) returning "reimbursement_id";`,
                                            [newReimbursement.author, newReimbursement.amount, newReimbursement.dateSubmitted, newReimbursement.description, newReimbursement.type])
        newReimbursement.reimbursementId = results.rows[0].reimbursement_id
        await client.query('COMMIT;')
        return newReimbursement
    }catch(e){
        client && client.query('ROLLBACK;')
        if(e.message === 'Type Not Found'){
            throw new InputError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }finally{
        client && client.release();
    }
}

//update reimbursements
export async function updateReimbursement(updatedReimbursement:Reimbursement):Promise<Reimbursement>{
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        await client.query('BEGIN')
        if (updatedReimbursement.author){
            let authorId = await client.query(`select u."user_id" from hitchhiker_reimbursement.users u
                            where u."user_id" = $1;`, [updatedReimbursement.author])
            if(authorId.rowCount === 0){
                throw new Error('Author not found')
            }
            authorId = authorId.rows[0].author
            await client.query(`update hitchhiker_reimbursement.reimbursements set "author" = $1 where "reimbursement_id" = $2;`,
                                [authorId, updatedReimbursement.reimbursementId])
        }
        if (updatedReimbursement.amount){
            await client.query(`update hitchhiker_reimbursement.reimbursements set "amount" = $1 where "reimbursement_id" = $2;`,
                                [updatedReimbursement.amount, updatedReimbursement.reimbursementId])
        }
        if (updatedReimbursement.dateSubmitted){
            await client.query(`update hitchhiker_reimbursement.reimbursements set "date_submitted" = $1 where "reimbursement_id" = $2;`,
                                [updatedReimbursement.dateSubmitted, updatedReimbursement.reimbursementId])
        }
        if (updatedReimbursement.dateResolved){
            await client.query(`update hitchhiker_reimbursement.reimbursements set "date_resolved" = $1 where "reimbursement_id" = $2;`,
                                [updatedReimbursement.dateResolved, updatedReimbursement.reimbursementId])
        }
        if (updatedReimbursement.description){
            await client.query(`update hitchhiker_reimbursement.reimbursements set "description" = $1 where "reimbursement_id" = $2;`,
                                [updatedReimbursement.description, updatedReimbursement.reimbursementId])
        }
        if (updatedReimbursement.resolver){
            let resolverId = await client.query(`select u."user_id" from hitchhiker_reimbursement.users u
                            where u."user_id" = $1;`, [updatedReimbursement.resolver])
            if(resolverId.rowCount === 0){
                throw new Error('Resolver not found')
            }
            resolverId = resolverId.rows[0].resolver
            await client.query(`update hitchhiker_reimbursement.reimbursements set "resolver" = $1 where "reimbursement_id" = $2;`,
                                [resolverId, updatedReimbursement.reimbursementId])
        }
        if (updatedReimbursement.status){
            let statusId = await client.query(`select s."status_id" from hitchhiker_reimbursement.reimbursement_statuses s
                            where s."status" = $1;`, [updatedReimbursement.status])
            if(statusId.rowCount === 0){
                throw new Error('Status not found')
            }
            statusId = statusId.rows[0].status_id
            await client.query(`update hitchhiker_reimbursement.reimbursements set "status" = $1 where "reimbursement_id" = $2;`,
                                [statusId, updatedReimbursement.reimbursementId])
                            
        }
        if (updatedReimbursement.type){
            let typeId = await client.query(`select s."type_id" from hitchhiker_reimbursement.reimbursement_types s
                            where s."type" = $1;`, [updatedReimbursement.type])
            if(typeId.rowCount === 0){
                throw new Error('Type not found')
            }
            typeId = typeId.rows[0].type_id
            await client.query(`update hitchhiker_reimbursement.reimbursements set "type" = $1 where "reimbursement_id" = $2;`,
                                [typeId, updatedReimbursement.reimbursementId])
        }

        await client.query('COMMIT;')
        return updatedReimbursement
    } catch (e) {
        client && client.query('ROLLBACK;')
        if(e.message == 'Reimbursement not found' || 'Author not nound' || 'Resolver not found' || 'Status not found' || 'Type not found'){
            throw new InputError()
        }
        console.log(e);
        throw new Error('Unhandled Error')
    } finally {
        client && client.release()
    }
}