import { Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';

export const expressGlobalErrorHandler: ErrorRequestHandler = async (
    err,
    req: Request,
    res: Response,
    next,
): Promise<void> => {
    // Handle the error here
    console.error(err);

    // Set an appropriate status code for the error
    res.status(500);

    // Send a JSON response with the error message
    res.json({
        error: 'Internal Server Error',
        message: err.message,
    });
};
