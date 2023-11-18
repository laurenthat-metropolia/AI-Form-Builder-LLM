import {
    faCircleCheck,
    faCircleExclamation,
    faCircleQuestion,
    faEye,
    faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '../components/Spinner';
import { Canvas, CanvasAnnotation } from '../components/Canvas';
import { JSONTree } from 'react-json-tree';
import {
    hideImageEventsValue,
    IdentifiableImageEvent,
    ImageEvents,
    ImageEventsColors,
    showImageEventsValue,
    SupportedFormComponent,
    UploadedFileWithIdentifiableImageEvents,
} from '@draw2form/shared';

export const UploadDetails = () => {
    const { id } = useParams();
    const [uploadedFile, setUploadedFile] = useState<UploadedFileWithIdentifiableImageEvents | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [canvasAnnotations, setCanvasAnnotations] = useState<CanvasAnnotation[]>([]);
    const [generatedForm, setGeneratedForm] = useState<SupportedFormComponent[][]>([]);
    const [hideCoordinates, setHideCoordinates] = useState<Record<string, boolean>>({});

    const stringToRGBColor = useCallback((str: keyof typeof ImageEvents): string => {
        return ImageEventsColors[str] ?? 'rgb(74 222 128)';
    }, []);

    const camelPad = useCallback((str: string) => {
        return (
            str
                // Look for long acronyms and filter out the last letter
                .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
                // Look for lower-case letters followed by upper-case letters
                .replace(/([a-z\d])([A-Z])/g, '$1 $2')
                // Look for lower-case letters followed by numbers
                .replace(/([a-zA-Z])(\d)/g, '$1 $2')
                .replace(/^./, function (str: string) {
                    return str.toUpperCase();
                })
                // Remove any white space left around the word
                .trim()
        );
    }, []);

    const checkImageEventCoordinateSupport = useCallback((imageEvent: IdentifiableImageEvent) => {
        return (
            Array.isArray(imageEvent.payload) && imageEvent.payload.every((it) => Array.isArray(it?.['coordinates']))
        );
    }, []);

    const getCoordinateList = useCallback(
        (imageEvent: IdentifiableImageEvent): [number, number, number, number][] => {
            if (!checkImageEventCoordinateSupport(imageEvent)) {
                return [];
            } else {
                const payload = imageEvent.payload as { coordinates: [number, number, number, number] }[];
                return payload.map((it) => it.coordinates);
            }
        },
        [checkImageEventCoordinateSupport],
    );

    const getImageEventLabel = useCallback(
        (imageEvent: IdentifiableImageEvent, index: number): string => {
            if (!checkImageEventCoordinateSupport(imageEvent)) {
                return '';
            } else {
                if (imageEvent.event === ImageEvents.ObjectDetectionResponseReceived) {
                    const payload = imageEvent.payload ?? [];
                    return payload[index]?.class ?? '';
                }
                if (imageEvent.event === ImageEvents.TextDetectionResponseReceived) {
                    const payload = imageEvent.payload ?? [];
                    return payload[index]?.text ?? '';
                }
                return '';
            }
        },
        [checkImageEventCoordinateSupport],
    );

    useEffect(() => {
        if (!uploadedFile) {
            return;
        }
        const events = uploadedFile.events ?? [];
        for (let imageEvent of events) {
            if (imageEvent.event === ImageEvents.FormComponentsCreated) {
                const payload = imageEvent.payload ?? [];
                setGeneratedForm(payload);
            }
        }
    }, [uploadedFile]);

    const toggleViewCoordinates = useCallback(
        (event: string) => {
            const newValue = structuredClone(hideCoordinates);
            newValue[event] = !newValue[event];
            setHideCoordinates(newValue);
        },
        [hideCoordinates],
    );
    useEffect(() => {
        if (!uploadedFile) {
            return;
        }

        const events = uploadedFile.events ?? [];
        const output: CanvasAnnotation[] = [];

        for (let imageEvent of events) {
            const hide = hideCoordinates[imageEvent.event] ?? false;

            if (hide) {
                continue;
            }

            const supportsCoordinates = checkImageEventCoordinateSupport(imageEvent);
            console.log({ supportsCoordinates });

            if (!supportsCoordinates) {
                continue;
            }

            const coordinates = getCoordinateList(imageEvent);
            console.log({ coordinates });
            const polygons: CanvasAnnotation[] =
                coordinates.map((coordinate, index): CanvasAnnotation => {
                    return {
                        type: 'rect',
                        color: stringToRGBColor(imageEvent.event),
                        payload: {
                            label: getImageEventLabel(imageEvent, index),
                            points: coordinate,
                        },
                    };
                }) ?? [];
            output.push(...polygons);
        }
        console.log({ output });
        setCanvasAnnotations(output);
    }, [uploadedFile, hideCoordinates]);

    useEffect(() => {
        if (!id) {
            return;
        }
        const interval = setInterval(() => {
            (async () => {
                try {
                    const env = process.env.NODE_ENV;
                    const url = env === 'development' ? `http://localhost:8000/api/upload/${id}` : `/api/upload/${id}`;
                    const result = await fetch(url);

                    const data: UploadedFileWithIdentifiableImageEvents = await result.json();

                    if (data.events && data.events.find((ev) => ev.event === ImageEvents.FormComponentsCreated)) {
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
            <div className="grid gap-2 grid-cols-12 pt-5">
                <button
                    onClick={() => {
                        if (Object.values(hideCoordinates).every((x) => x)) {
                            setHideCoordinates(showImageEventsValue);
                        } else {
                            setHideCoordinates(hideImageEventsValue);
                        }
                    }}
                    className="col-span-12 shadow rounded p-2 mt-2">
                    <span>
                        <span className="text-gray-400">
                            <FontAwesomeIcon icon={faEyeSlash} />
                        </span>
                        <span className="text-green-400">
                            <FontAwesomeIcon icon={faEye} />
                        </span>
                    </span>
                </button>
                {Object.values(ImageEvents).map((eventName) => {
                    const exist = uploadedFile?.events?.find((it: any) => it.event === eventName);

                    const supportsCoordinates = exist ? checkImageEventCoordinateSupport(exist) : false;

                    const hide = hideCoordinates[eventName] ?? false;
                    return (
                        <div
                            key={eventName}
                            className="col-span-12 lg:col-span-4 grid grid-cols-12 items-center gap-2 lg:flex-row">
                            <span className="col-span-2 flex flex-row-reverse gap-1">
                                {exist === undefined && (
                                    <span className="text-gray-700">
                                        <FontAwesomeIcon icon={faCircleQuestion} />
                                    </span>
                                )}
                                {exist && (exist as any).payload === null && (
                                    <span className="text-red-400">
                                        <FontAwesomeIcon icon={faCircleExclamation} />
                                    </span>
                                )}
                                {exist && (exist as any).payload !== null && (
                                    <span className="text-green-400">
                                        <FontAwesomeIcon icon={faCircleCheck} />
                                    </span>
                                )}
                                {supportsCoordinates && (
                                    <button
                                        onClick={() => {
                                            toggleViewCoordinates(eventName);
                                        }}>
                                        {hide ? (
                                            <span className="text-gray-400">
                                                <FontAwesomeIcon icon={faEyeSlash} />
                                            </span>
                                        ) : (
                                            <span
                                                className="text-green-400"
                                                style={{ color: stringToRGBColor(eventName) }}>
                                                <FontAwesomeIcon icon={faEye} />
                                            </span>
                                        )}
                                    </button>
                                )}
                            </span>
                            <small className="col-span-10">{camelPad(eventName)}</small>
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
                    <div className="grid grid-cols-12 gap-2 p-4 border rounded">
                        {generatedForm.map((formRow, formRowIndex) => {
                            const onlyHasOneElement = formRow.length === 1;
                            const onlyHasTwoElement = formRow.length === 2;
                            const centerClassNames = onlyHasOneElement ? 'w-full flex justify-center' : '';
                            return (
                                <div
                                    className="col-span-12 grid grid-cols-12 gap-1 p-1 border rounded"
                                    key={formRowIndex}>
                                    {formRow.map((formField, index) => {
                                        const name = formField[0];
                                        return (
                                            <div
                                                key={name + index}
                                                className={`${
                                                    onlyHasOneElement
                                                        ? 'col-span-12'
                                                        : onlyHasTwoElement
                                                        ? 'col-span-6'
                                                        : 'col-span-4'
                                                } flex items-center gap-1 p-1 border rounded`}>
                                                {name === 'FormImage' && (
                                                    <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded  dark:bg-gray-700">
                                                        <svg
                                                            className="w-10 h-10"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 18">
                                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {name === 'FormLabel' && (
                                                    <div className={`${centerClassNames}`}>
                                                        <h5 className="text-xl font-bold ">{formField[1].label}</h5>
                                                    </div>
                                                )}
                                                {name === 'FormButton' && (
                                                    <div className={`${centerClassNames}`}>
                                                        <button
                                                            type="button"
                                                            className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 focus:outline-none">
                                                            {formField[1].label}
                                                        </button>
                                                    </div>
                                                )}
                                                {name === 'FormTextField' && (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="first_name"
                                                            placeholder={formField[1].label}
                                                            className=" border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                            required
                                                        />
                                                    </div>
                                                )}
                                                {name === 'FormCheckbox' && (
                                                    <div className="flex items-center">
                                                        <input
                                                            checked
                                                            id="checked-checkbox"
                                                            type="checkbox"
                                                            onChange={() => {}}
                                                            value=""
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                        <label
                                                            htmlFor="checked-checkbox"
                                                            className="ms-2 text-sm font-medium">
                                                            {formField[1].label}
                                                        </label>
                                                    </div>
                                                )}
                                                {name === 'FormToggleSwitch' && (
                                                    <div className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            onChange={() => {}}
                                                            value=""
                                                            className="sr-only peer"
                                                            checked
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        <span className="ms-3 text-sm font-medium">
                                                            {formField[1].label}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="col-span-6 flex flex-col gap-2 p-4 rounded h-screen">
                <h4>Debug:</h4>
                <JSONTree data={uploadedFile ?? {}} />
            </div>
        </div>
    );
};
