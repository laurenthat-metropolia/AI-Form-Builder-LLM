import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Router } from 'react-router-dom';
import App from './app/app';
import { Upload } from './app/pages/Upload';
import { UploadDetails } from './app/pages/UploadDetails';
import { AndroidLinkLoginMissingApp } from './app/android/auth/login/AndroidLinkLoginMissingApp';
import NxWelcome from './app/nx-welcome';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/upload',
                element: <Upload />,
            },
            {
                path: '/upload/:id',
                element: <UploadDetails />,
            },
        ],
    },
    {
        path: '/android/auth/login',
        element: <AndroidLinkLoginMissingApp />,
    },
]);

root.render(
    <StrictMode>
        <NxWelcome title=""></NxWelcome>
        {/*<RouterProvider router={router} />*/}
    </StrictMode>,
);
