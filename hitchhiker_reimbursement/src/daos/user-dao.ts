import { PoolClient } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConvertor } from "../utils/UserDTO-to-User-convertor";
import { User } from "../models/User";
import {InvalidCredentialsError} from "../errors/InvalidCredentialsError"
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { InputError } from "../errors/InputError";
//import { userRouter } from "../routers/user-router";


export async function getAllUsers(){
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        let results = await client.query(`select u.user_id, u.username , u."password" , u.first_name, u.last_name, u.email, r.role_id , r."role" from hitchhiker_reimbursement.users u left join hitchhiker_reimbursement.roles r on u."role" = r.role_id;`)
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
                u."username", 
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

export async function updateUser(updatedUser: User){
    let client: PoolClient;
    try{
        client = await connectionPool.connect();
        client.query('begin');
        //it's not elegant but hopefully it's functional
        if(updatedUser.username) {
            await client.query(`update hitchhiker_reimbursement.users set "username" = $1 
                                    where "user_id" = $2;`, 
                                    [updatedUser.username, updatedUser.userId])
        }
        if(updatedUser.password) {
            await client.query(`update hitchhiker_reimbursement.users set "password" = $1 
                                    where "user_id" = $2;`, 
                                    [updatedUser.password, updatedUser.userId])
        }
        if(updatedUser.firstName) {
            await client.query(`update hitchhiker_reimbursement.users set "first_name" = $1 
                                    where "user_id" = $2;`, 
                                    [updatedUser.firstName, updatedUser.userId])
        }
        if(updatedUser.lastName) {
            await client.query(`update hitchhiker_reimbursement.users set "last_name" = $1 
                                    where "user_id" = $2;`, 
                                    [updatedUser.lastName, updatedUser.userId])
        }
        if(updatedUser.email) {
            await client.query(`update hitchhiker_reimbursement.users set "email" = $1 
                                    where "user_id" = $2;`, 
                                    [updatedUser.email, updatedUser.userId])
        }
        if(updatedUser.role) {
            let roleId = await client.query(`select r."role_id" from hitchhiker_reimbursement.roles r 
                                        where r."role" = $1`,
                                        [updatedUser.role])
            if(roleId.rowCount === 0) {
                throw new Error('Role Not Found')
            }
            roleId = roleId.rows[0].role_id
            await client.query(`update hitchhiker_reimbursement.users set "role" = $1 
                                    where "user_id" = $2;`, 
                                    [roleId, updatedUser.userId])
        }

        await client.query('COMMIT;')
        return updatedUser
    } catch (e) {
        client && client.query('ROLLBACK;')
        if(e.message === 'Role Not Found') {
            throw new InputError()
        }
        console.log(e);
        throw new Error('Unhandled Error')
    } finally {
        client && client.release()
    }
}