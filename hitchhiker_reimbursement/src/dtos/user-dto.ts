import { Role } from '../models/Role'

export class UserDTO {
    user_id:number
    username:string
    password:string
    firstName:string
    lastName:string
    email:string
    role:Role
    role_id:number
}