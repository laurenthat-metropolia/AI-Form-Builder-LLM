import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { AppRouter } from './routes';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <StrictMode>
        <AppRouter></AppRouter>
    </StrictMode>,
);
