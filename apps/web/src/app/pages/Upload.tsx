import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FileUpload } from '../components/FileUpload';

export const Upload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [alerts, setAlerts] = useState<{ className: string; message: string }[]>([]);
    const [loginInformation] = useContext(AuthContext);

    let navigate = useNavigate();

    useEffect(() => {
        if (!file) {
            return;
        }
        (async () => {
            const formData = new FormData();
            formData.append('image', file);
            try {
                setAlerts([]);
                const env = process.env.NODE_ENV;
                setLoading(true);
                const url = env === 'development' ? `http://localhost:8000/api/upload` : `/api/upload`;

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

                navigate(`/upload/${data.id}`);

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
    }, [file, navigate]);
    return (
        <div>
            <div className="max-w-5xl p-2 my-2  mx-auto ">
                {alerts.map((alert) => {
                    return (
                        <div
                            className={`p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 ${alert.className}`}
                            role="alert">
                            {alert.message}
                        </div>
                    );
                })}
            </div>
            <div className="max-w-md mx-auto">
                <FileUpload loading={loading} onFileSelected={setFile} className="h-64" />
            </div>
        </div>
    );
};
