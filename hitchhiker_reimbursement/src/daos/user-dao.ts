import { PoolClient } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConvertor } from "../utils/UserDTO-to-User-convertor";
import { User } from "../models/User";
import {InvalidCredentialsError} from "../errors/InvalidCredentialsError"
import { UserNotFoundError } from "../errors/UserNotFoundError";


export async function getAllUsers(){
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        let results = await client.query(`select u.user_id, u.username , u."password" , u.first_name, u.last_name u.email ,r.role_id , r."role" from hitchhiker_reimbursement.users u left join hitchhiker_reimbursement.roles r on u."role" = r.role_id;`)
        return results.rows.map(UserDTOtoUserConvertor)
    }catch(e){ 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }finally{
        client && client.release()
    }
}

export async function getUserById(id: number):Promise<User> {
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results = await client.query(`select u.user_id, 
                u.username , 
                u."password" ,
                u.first_name,
                u.last_name, 
                u.email ,
                r.role_id , 
                r."role" 
                from hitchhiker_reimbursement.users u left join hitchhiker_reimbursement.roles r on u."role" = r.role_id 
                where u.user_id = $1;`,
            [id])
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])
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


//login (hopefully)
export async function getUserByUsernameAndPassword(username:string, password:string):Promise<User>{
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results = await client.query(`select u.user_id, 
                u.username", 
                u."password" ,
                u.first_name ,
                u.last_name , 
                u.email ,
                r.role_id , 
                r."role" 
                from hitchhiker_reimbursement.users u left join hitchhiker_reimbursement.roles r on u."role" = r.role_id 
                where u."username" = $1 and u."password" = $2;`,
            [username, password])
        if(results.rowCount === 0){
            throw new Error('User Not Found')
        }
        return UserDTOtoUserConvertor(results.rows[0])
    } catch (e) {
        if(e.message === 'User Not Found'){
            throw new InvalidCredentialsError()
        }
        console.log(e)
        throw new Error('Unhandled Error Occured')
    } finally {
        client && client.release()
    }
}
