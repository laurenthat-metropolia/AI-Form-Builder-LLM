import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Form } from '@prisma/client';
import { FileUpload } from '../components/FileUpload';
import { EnvContext } from '../contexts/EnvContext';

export const Forms = () => {
    const [file, setFile] = useState<File | null>(null);

    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [alerts, setAlerts] = useState<{ className: string; message: string }[]>([]);
    const [loginInformation] = useContext(AuthContext);
    const env = useContext(EnvContext);

    useEffect(() => {
        if (!file) {
            return;
        }
        (async () => {
            const formData = new FormData();
            formData.append('image', file);
            try {
                setAlerts([]);
                setLoading(true);
                const url = env === 'development' ? `http://localhost:8000/api/forms` : `/api/forms`;

                const headers: Record<string, string> = loginInformation
                    ? {
                          Authorization: `Bearer ${loginInformation.token.accessToken}`,
                      }
                    : {};

                const result = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers,
                });

                const data = await result.json();
                setLoading(false);
                updateFormList();
                console.log(data);
            } catch (error: any) {
                console.error(error);
                setLoading(false);
                setAlerts([
                    {
                        message: `Upload Failed. Message: "${error?.message}" Exception: "${error}" Check console for more information.`,
                        className: 'text-red-800 bg-red-50',
                    },
                ]);
            }
        })();
    }, [file, env]);

    const updateFormList = useCallback(() => {
        (async () => {
            try {
                setAlerts([]);
                const env = process.env.NODE_ENV;
                setLoading(true);
                const url = env === 'development' ? `http://localhost:8000/api/forms` : `/api/forms`;

                const headers: Record<string, string> = loginInformation
                    ? {
                          Authorization: `Bearer ${loginInformation.token.accessToken}`,
                      }
                    : {};

                const result = await fetch(url, {
                    method: 'GET',
                    headers,
                });

                const data = await result.json();
                setLoading(false);
                setForms(data);
            } catch (error: any) {
                console.error(error);
                setLoading(false);
                setAlerts([
                    {
                        message: `Api call Failed. Message: "${error?.message}" Exception: "${error}" Check console for more information.`,
                        className: 'text-red-800 bg-red-50',
                    },
                ]);
            }
        })();
    }, [loginInformation]);

    useEffect(() => {
        updateFormList();
    }, [updateFormList]);

    return (
        <div>
            <div className="max-w-5xl p-2 my-2  mx-auto ">
                <FileUpload loading={loading} onFileSelected={(file) => setFile(file)} />
                <div className="container  px-4 mx-auto sm:px-8">
                    <div className="py-8">
                        <div className="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8">
                            <div className="inline-block min-w-full overflow-hidden rounded-lg shadow">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-3 text-sm font-normal text-left text-gray-800 uppercase bg-white border-b border-gray-200">
                                                status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forms.map((form) => {
                                            return (
                                                <tr>
                                                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                        <div className="flex items-center">
                                                            <div className="ml-3">
                                                                <p className="text-gray-900 whitespace-no-wrap">
                                                                    {form.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                        <span className="relative inline-block px-3 py-1 font-semibold leading-tight text-green-900">
                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-0 bg-green-200 rounded-full opacity-50"></span>
                                                            <span className="relative">{form.status}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
