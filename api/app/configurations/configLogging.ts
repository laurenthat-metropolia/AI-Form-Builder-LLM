import { Application } from 'express';
import morgan from 'morgan';

export function configLogging(app: Application) {
    app.use(
        morgan(':method :status :url :response-time', {
            skip: function (req, res) {
                return res.statusCode < 400;
            },
        }),
    );
}
