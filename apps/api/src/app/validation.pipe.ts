import {
    ArgumentMetadata,
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * @description this class is responsible for validating the Classes coming from client side
 * and converting them to real ones.
 */
@Injectable()
export class AppValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        if (value === undefined) {
            throw new BadRequestException();
        }
        const { metatype } = metadata;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const request = plainToClass(metatype, value);

        const validationErrors: ValidationError[] = await validate(request);

        if (validationErrors.length > 0) {
            console.log(JSON.stringify(validationErrors, undefined, 4));
            throw new HttpException(validationErrors, HttpStatus.BAD_REQUEST);
        }

        return request;
    }
}
