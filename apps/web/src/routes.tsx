import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './app/app';
import { Upload } from './app/pages/Upload';
import { UploadDetails } from './app/pages/UploadDetails';
import { AndroidLinkLoginMissingApp } from './app/android/auth/login/AndroidLinkLoginMissingApp';

export function AppRouter() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}
export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
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
