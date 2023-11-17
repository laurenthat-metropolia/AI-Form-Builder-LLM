import session from 'express-session';
import { Express } from 'express';
import { environment } from './environment';
import { randomUUID } from 'crypto';

export function configSession(app: Express) {
  app.set('trust proxy', 1); // trust first proxy
  app.use(
    session({
      genid: function (req: any) {
        return randomUUID(); // use UUIDs for session IDs
      },
      resave: true,
      saveUninitialized: true,
      secret: environment.APP_SESSION_SECRET,
    })
  );
}
