import {
    faCircleCheck,
    faCircleExclamation,
    faCircleQuestion,
    faWindowMinimize,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiImageEvents, ApiUploadedFile } from '../types';
import { Spinner } from '../components/Spinner';

export const UploadDetails = () => {
    const { id } = useParams();
    const [uploadedFile, setUploadedFile] = useState<ApiUploadedFile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        if (!id) {
            return;
        }
        const interval = setInterval(() => {
            (async () => {
                try {
                    const url = `http://localhost:8000/api/preview/upload/${id}`;
                    // const url = `/api/preview/upload/${id}`
                    // You can write the URL of your server or any other endpoint used for file upload
                    const result = await fetch(url);

                    const data: ApiUploadedFile = await result.json();

                    if (data.events && data.events.length >= 3) {
                        clearInterval(interval);
                        setLoading(false);
                    }
                    setUploadedFile(data);
                } catch (error) {
                    console.error(error);
                }
            })();
        }, 1000);
        return () => clearInterval(interval);
    }, [id]);

    return (
        <div>
            <div className="flex gap-6 justify-center py-6">
                {[
                    [ApiImageEvents.OBJECT_DETECTION_COMPLETED, 'Object detection'],
                    [ApiImageEvents.TEXT_DETECTION_COMPLETED, 'Text detection'],
                    [ApiImageEvents.STRUCTURE_GENERATION_COMPLETED, 'Form generation'],
                ].map(([eventName, label]) => {
                    const exist = uploadedFile?.events?.find((it) => it.event === eventName);
                    return (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                {exist === undefined && (
                                    <span className="text-gray-700">
                                        <FontAwesomeIcon icon={faCircleQuestion} />
                                    </span>
                                )}
                                {exist && exist.payload === null && (
                                    <span className="text-red-400">
                                        <FontAwesomeIcon icon={faCircleExclamation} />
                                    </span>
                                )}
                                {exist && exist.payload !== null && (
                                    <span className="text-green-400">
                                        <FontAwesomeIcon icon={faCircleCheck} />
                                    </span>
                                )}
                            </span>
                            <span>{label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center">
                {loading && (
                    <span className="text-green-400">
                        <Spinner />
                    </span>
                )}
            </div>
            <code>
                <pre>{JSON.stringify(uploadedFile, undefined, 4)}</pre>
            </code>
            <FontAwesomeIcon icon={faWindowMinimize} />
        </div>
    );
};
