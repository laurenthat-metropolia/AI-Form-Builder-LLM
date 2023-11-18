import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './app/app';
import { Upload } from './app/pages/Upload';
import { UploadDetails } from './app/pages/UploadDetails';
import { AndroidLinkLoginMissingApp } from './app/android/auth/login/AndroidLinkLoginMissingApp';
import { AndroidLaunchForLogin } from './app/android/auth/login/AndroidLaunchForLogin';

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
            {
                path: '/apps/launch/android',
                element: <AndroidLaunchForLogin />,
            },
            {
                path: '/android/auth/login',
                element: <AndroidLinkLoginMissingApp />,
            },
        ],
    },
]);
