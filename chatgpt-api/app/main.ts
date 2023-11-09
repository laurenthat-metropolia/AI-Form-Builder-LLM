import express, { Request, Response } from 'express';

import { configParsers } from './configurations/configParsers.js';

import { ErrorRequestHandler } from 'express-serve-static-core';
import morgan from 'morgan';
// Express App
const app = express();

app.use(
    morgan(':method :status :url :response-time', {
        skip: function (req, res) {
            return res.statusCode < 400;
        },
    }),
);

// Parsing capabilities for body of request.
configParsers(app);

const router = express.Router()

app.use('/chatgpt', router);

router.get('/', async (req: Request, res: Response): Promise<void> => {
    res.status(404).send({
        message: "Did you mean to send a POST request instead of GET?"
    });
    return;
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    res.status(501).send({
        message: "CHATGPT NOT IMPLEMENTED YET."
    });
    return;
});

// Define a global error handler middleware
router.use((async (err, req: Request, res: Response, next): Promise<void> => {
    // Handle the error here
    console.error(err);

    // Set an appropriate status code for the error
    res.status(500);

    // Send a JSON response with the error message
    res.json({
        error: 'Internal Server Error',
        message: err.message,
    });
}) satisfies ErrorRequestHandler<any>);

app.listen(8002, '0.0.0.0', (): void => {
    console.log('Started listening on port 8002');
});
process.on('SIGTERM', function() {
    console.log('\ncaught SIGTERM, stopping gracefully');
    process.exit(1);
});
process.on('SIGINT', function() {
    console.log('\ncaught SIGINT, stopping gracefully');
    process.exit();
});
