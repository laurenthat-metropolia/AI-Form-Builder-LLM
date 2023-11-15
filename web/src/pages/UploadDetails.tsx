import {
    faCircleCheck,
    faCircleExclamation,
    faCircleQuestion,
    faWindowMinimize,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    ApiFormButton,
    ApiFormCheckbox,
    ApiFormGenerationEvent,
    ApiFormImage,
    ApiFormLabel,
    ApiFormTextField,
    ApiFormToggleSwitch,
    ApiImageEvent,
    ApiImageEvents,
    ApiImageObjectDetectionEvent,
    ApiImageTextDetectionEvent,
    ApiUploadedFile,
    ApiUploadedFileWithParsedPayload,
} from '../types';
import { Spinner } from '../components/Spinner';
import { Canvas, CanvasAnnotation } from '../components/Canvas';
import * as events from 'events';

type ParseEvent = ApiImageEvent & {
    parsedPayload: {};
};
export const UploadDetails = () => {
    console.log();
    const { id } = useParams();
    const [uploadedFile, setUploadedFile] = useState<ApiUploadedFileWithParsedPayload | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [canvasAnnotations, setCanvasAnnotations] = useState<CanvasAnnotation[]>([]);
    const [generatedForm, setGeneratedForm] = useState<
        (
            | ['FormTextField', ApiFormTextField, any]
            | ['FormCheckbox', ApiFormCheckbox, any]
            | ['FormButton', ApiFormButton, any]
            | ['FormImage', ApiFormImage, any]
            | ['FormLabel', ApiFormLabel, any]
            | ['FormToggleSwitch', ApiFormToggleSwitch, any]
        )[]
    >([]);

    useEffect(() => {
        if (!uploadedFile) {
            return;
        }
        const output: CanvasAnnotation[] = [];

        const normalize = (input: number[]): [number, number][] => {
            const output: [number, number][] = [];

            for (let i = 0; i < input.length; i += 2) {
                output.push(input.slice(i, i + 2) as [number, number]);
            }
            return output;
        };

        {
            const ev = uploadedFile.events?.find((event) => event.event === 'TEXT_DETECTION_COMPLETED') as
                | ApiImageTextDetectionEvent
                | undefined;

            const polygons: CanvasAnnotation[] =
                ev?.parsedPayload?.map(({ text, boundingBox }): CanvasAnnotation => {
                    const normalized = normalize(boundingBox ?? []);
                    return {
                        type: 'polygon',
                        payload: {
                            label: text,
                            points: normalized,
                        },
                    };
                }) ?? [];
            output.push(...polygons);
        }

        {
            const ev = uploadedFile.events?.find((event) => event.event === 'OBJECT_DETECTION_COMPLETED') as
                | ApiImageObjectDetectionEvent
                | undefined;

            const polygons: CanvasAnnotation[] =
                ev?.parsedPayload?.map((payload): CanvasAnnotation => {
                    const className = payload['class'];
                    return {
                        type: 'rect',
                        payload: {
                            label: className,
                            points: [
                                payload.x - payload.width / 2,
                                payload.y - payload.height / 2,
                                payload.coordinates[2] - payload.width / 2,
                                payload.coordinates[3] - payload.height / 2,
                            ],
                        },
                    };
                }) ?? [];
            output.push(...polygons);
        }

        {
            const ev = uploadedFile.events?.find((event) => event.event === 'STRUCTURE_GENERATION_COMPLETED') as
                | ApiFormGenerationEvent
                | undefined;
            console.log(ev?.parsedPayload);
            setGeneratedForm((ev?.parsedPayload ?? []).sort((i, v) => (i[1].order > v[1].order ? 1 : -1)));
        }
        setCanvasAnnotations(output);
    }, [uploadedFile]);

    useEffect(() => {
        if (!id) {
            return;
        }
        const interval = setInterval(() => {
            (async () => {
                try {
                    const env = process.env.NODE_ENV;
                    const url =
                        env === 'development'
                            ? `http://localhost:8000/api/preview/upload/${id}`
                            : `/api/preview/upload/${id}`;
                    const result = await fetch(url);

                    const data: ApiUploadedFileWithParsedPayload = await result.json();

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
        <div className="max-w-7xl mx-auto">
            <div className="flex gap-6 justify-center py-6">
                {[
                    [ApiImageEvents.OBJECT_DETECTION_COMPLETED, 'Object detection'],
                    [ApiImageEvents.TEXT_DETECTION_COMPLETED, 'Text detection'],
                    [ApiImageEvents.STRUCTURE_GENERATION_COMPLETED, 'Form generation'],
                ].map(([eventName, label]) => {
                    const exist = uploadedFile?.events?.find((it) => it.event === eventName);
                    return (
                        <div key={label} className="flex items-center gap-2">
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
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 p-4">
                <div className="col-span-6 shadow-md p-2 flex flex-col gap-2 p-4 rounded">
                    <h4>Original Image:</h4>
                    {uploadedFile !== null && <Canvas url={uploadedFile.url} annotations={canvasAnnotations} />}
                </div>
                <div className="col-span-6 shadow-md p-2 flex flex-col gap-2 p-4 rounded">
                    <h4>Generated Form:</h4>
                    {generatedForm.map((formField) => {
                        switch (formField[0]) {
                            case 'FormImage':
                                return (
                                    <div
                                        role="status"
                                        className="space-y-8 md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
                                        <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
                                            <svg
                                                className="w-10 h-10"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 20 18">
                                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                            </svg>
                                        </div>
                                    </div>
                                );

                            case 'FormLabel':
                                return <h5 className="text-xl font-bold ">{formField[1].value}</h5>;

                            case 'FormButton':
                                return (
                                    <div>
                                        <button
                                            type="button"
                                            className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 focus:outline-none">
                                            {formField[1].label}
                                        </button>
                                    </div>
                                );
                            case 'FormTextField':
                                return (
                                    <div>
                                        <input
                                            type="text"
                                            id="first_name"
                                            placeholder={formField[1].label}
                                            className=" border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            required
                                        />
                                    </div>
                                );
                            case 'FormCheckbox':
                                return (
                                    <div className="flex items-center">
                                        <input
                                            checked
                                            id="checked-checkbox"
                                            type="checkbox"
                                            value=""
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="checked-checkbox" className="ms-2 text-sm font-medium">
                                            {formField[1].label}
                                        </label>
                                    </div>
                                );
                            case 'FormToggleSwitch':
                                return (
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" value="" className="sr-only peer" checked />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        <span className="ms-3 text-sm font-medium">{formField[1].label}</span>
                                    </div>
                                );
                        }
                    })}
                </div>
            </div>
            <div className="col-span-6    flex flex-col gap-2 p-4 rounded">
                <code className="overflow-hidden max-w-7xl shadow-md">
                    <pre className="overflow-hidden max-w-7xl overflow-x-scroll p-2">
                        <h4>Debug:</h4>
                        {JSON.stringify(uploadedFile, undefined, 4)}
                    </pre>
                </code>
            </div>
        </div>
    );
};
