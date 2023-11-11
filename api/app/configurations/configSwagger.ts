import swaggerUi from 'swagger-ui-express';

import swaggerDocument from '../../swagger.json' assert { type: 'json' };

export function configSwagger(app: any) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
