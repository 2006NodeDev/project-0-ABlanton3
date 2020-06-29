import { ReimbursementDTO } from "../dtos/reimbursement-dto";
import {Reimbursement } from "../models/Reimbursement";

export function ReimbursementDTOtoReimbursementConvertor(bto:ReimbursementDTO):Reimbursement{
    return{
        reimbursementId: bto.reimbursement_id,
        author: bto.author,
        amount: bto.amount,
        dateSubmitted: bto.date_submitted.getFullYear(),
        dateResolved: bto.date_resolved.getFullYear(),
        description: bto.description,
        resolver: bto.resolver,
        status: bto.status,
        type: bto.type
    }
}