import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider, Router } from 'react-router-dom';
import { Upload } from './pages/Upload';
import { UploadDetails } from './pages/UploadDetails';
import { AndroidLinkLoginMissingApp } from './android/auth/login/AndroidLinkLoginMissingApp';
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
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
