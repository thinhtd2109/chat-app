import { BadRequestError, JoiValidateError } from "@global/helpers/error.handler";
import { Request } from "express";
import { ObjectSchema } from "joi";

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        const originMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const req: Request = args[0];
            const { error } = schema.validate(req.body);
            if (error?.details) {
                throw new BadRequestError(error.details[0].message);
            }
            return originMethod.apply(this, args);
        };
        return descriptor;
    }
}