import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { EnvContext } from '../contexts/EnvContext';
import { FormFullType, UIComponent } from '@draw2form/shared';
import { Checkbox, Label, Spinner, ToggleSwitch } from 'flowbite-react';
import Lottie from 'lottie-react';
import formFilledJson from '../../assets/form-filled-animation.json';

export const SubmitForm = () => {
    const [params] = useSearchParams();

    const [loginInformation] = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [form, setForm] = useState<FormFullType | null>(null);
    const [succeeded, setSucceeded] = useState<boolean>(false);
    const [uiComponents, setUIComponents] = useState<UIComponent[]>([]);
    const [alerts, setAlerts] = useState<{ className: string; message: string }[]>([]);
    const env = useContext(EnvContext);

    const [id] = useState<string | null>(params.get('id') ?? null);

    useEffect(() => {
        if (!id) {
            return;
        }
        (async () => {
            try {
                setAlerts([]);
                setLoading(true);
                const url = env === 'development' ? `http://localhost:8000/api/forms/${id}` : `/api/forms/${id}`;

                const headers: Record<string, string> = loginInformation
                    ? {
                          Authorization: `Bearer ${loginInformation.token.accessToken}`,
                      }
                    : {};

                const result = await fetch(url, {
                    method: 'GET',
                    headers,
                });
                console.log(result.status);
                setLoading(false);

                if (result.status === 404) {
                    setAlerts([
                        {
                            message: `It seems like the provided link might be invalid or the owner has removed the form.`,
                            className: 'text-red-800 bg-red-50',
                        },
                    ]);
                } else {
                    const data = (await result.json()) as FormFullType;

                    setForm(data);
                    setUIComponents(UIComponent.fromForm(data).sort((a, b) => a.order - b.order));
                }
            } catch (error: any) {
                console.error(error);
                setLoading(false);
                setAlerts([
                    {
                        message: `Form loading failed. Message: "${error?.message}" Exception: "${error}" Check console for more information.`,
                        className: 'text-red-800 bg-red-50',
                    },
                ]);
            }
        })();
    }, [id]);

    const submit = useCallback(() => {
        (async () => {
            try {
                console.log('Submitting...');
                setLoading(true);

                const toggleSwitchResponses = uiComponents.map((x) => x.toggleSwitchResponse).filter((x) => x);
                const textFieldResponses = uiComponents.map((x) => x.textFieldResponse).filter((x) => x);
                const checkboxResponses = uiComponents.map((x) => x.checkboxResponse).filter((x) => x);

                const body: {
                    textFieldResponses: { id: string; value: string }[];
                    checkboxResponses: { id: string; value: boolean }[];
                    toggleSwitchResponses: { id: string; value: boolean }[];
                } = {
                    textFieldResponses: textFieldResponses.map((x) => ({ id: x?.textFieldId, value: x?.value })),
                    checkboxResponses: checkboxResponses.map((x) => ({ id: x?.checkboxId, value: x?.value })),
                    toggleSwitchResponses: toggleSwitchResponses.map((x) => ({
                        id: x?.toggleSwitchId,
                        value: x?.value,
                    })),
                };
                console.log({ body });
                const url =
                    env === 'development' ? `http://localhost:8000/api/forms/${id}/submit` : `/api/forms/${id}/submit`;

                const headers: Record<string, string> = loginInformation
                    ? {
                          Authorization: `Bearer ${loginInformation.token.accessToken}`,
                          'Content-Type': 'application/json',
                      }
                    : {
                          'Content-Type': 'application/json',
                      };
                console.log({ headers });

                console.log(body);

                const result = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                });

                const data = await result.json();
                console.log({ data });

                setLoading(false);

                if (result.status >= 400) {
                    setAlerts([
                        {
                            message: `Form submission failed. message: ${data?.message}. Check console for more information. `,
                            className: 'text-red-800 bg-red-50',
                        },
                    ]);
                } else {
                    setLoading(false);
                    setSucceeded(true);
                }
            } catch (error: any) {
                setLoading(false);
                setAlerts([
                    {
                        message: `Form loading failed. Message: "${error?.message}" Exception: "${error}" Check console for more information.`,
                        className: 'text-red-800 bg-red-50',
                    },
                ]);
            }
        })().then();
    }, [uiComponents, env]);
    return (
        <div>
            <div className="max-w-5xl p-2 my-2  mx-auto ">
                {alerts.map((alert, i) => {
                    return (
                        <div
                            key={i}
                            className={`p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 ${alert.className}`}
                            role="alert">
                            {alert.message}
                        </div>
                    );
                })}
            </div>
            {loading && (
                <div className="absolute left-0 top-0 bottom-0 right-0 z-20 flex justify-center items-center">
                    <div className="absolute left-0 top-0 bottom-0 right-0 opacity-50 flex justify-center items-center bg-white"></div>
                    <Spinner aria-label="Default status example" />
                </div>
            )}
            {succeeded && (
                <div className="flex justify-center flex-col items-center">
                    <Lottie animationData={formFilledJson} loop={false} />
                    <Label className="text-lg">
                        "Congratulations! Your form has been successfully submitted. You can now close this window.
                        Thank you!"
                    </Label>
                </div>
            )}
            {!succeeded && (
                <div className="max-w-5xl my-4 mx-auto grid grid-cols-12 gap-1 p-1 border rounded">
                    {uiComponents.map((uiComponent, index) => {
                        return (
                            <div key={index} className={`col-span-12 flex items-center gap-1 p-1 px-2  rounded`}>
                                {uiComponent.image && (
                                    <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded  dark:bg-gray-700">
                                        {uiComponent.image.url ? (
                                            <img
                                                src={uiComponent.image.url}
                                                alt="User Image"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                className="w-10 h-10"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 20 18">
                                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                                {uiComponent.label && (
                                    <div className={`w-full flex justify-center`}>
                                        <Label htmlFor={`cl-${index}`} className="flex">
                                            {uiComponent.label.label}
                                        </Label>
                                    </div>
                                )}
                                {uiComponent.textField && (
                                    <div className={`w-full grid grid-cols-2 gap-2 items-center`}>
                                        <Label htmlFor={`cl-${index}`} className="flex">
                                            {uiComponent.textField.label}
                                        </Label>
                                        <input
                                            id={`cl-${index}`}
                                            type="text"
                                            placeholder={uiComponent.textField.label}
                                            className=" border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            required
                                            onChange={(e) => {
                                                const copy = structuredClone(uiComponent);

                                                copy.textFieldResponse = copy.textFieldResponse ?? {
                                                    id: '',
                                                    value: '',
                                                    textFieldId: copy.textField?.id,
                                                    submissionId: '',
                                                };
                                                copy.textFieldResponse.value = e.target.value;

                                                const list = structuredClone(uiComponents);
                                                list[index] = copy;

                                                setUIComponents(list);
                                            }}
                                        />
                                    </div>
                                )}
                                {uiComponent.checkbox && (
                                    <div className={`w-full grid grid-cols-2 gap-2 items-center`}>
                                        <Label htmlFor={`cl-${index}`} className="flex">
                                            {uiComponent.checkbox.label}
                                        </Label>

                                        <Checkbox
                                            id={`cl-${index}`}
                                            checked={uiComponent.checkboxResponse?.value}
                                            onChange={(e) => {
                                                const copy = structuredClone(uiComponent);

                                                copy.checkboxResponse = copy.checkboxResponse ?? {
                                                    id: '',
                                                    value: false,
                                                    checkboxId: copy.checkbox?.id,
                                                    submissionId: '',
                                                };
                                                copy.checkboxResponse.value = e.target.checked;

                                                const list = structuredClone(uiComponents);
                                                list[index] = copy;

                                                setUIComponents(list);
                                            }}
                                        />
                                    </div>
                                )}
                                {uiComponent.toggleSwitch && (
                                    <div className={`w-full grid grid-cols-2 gap-2 items-center`}>
                                        <Label htmlFor={`cl-${index}`} className="flex">
                                            {uiComponent.toggleSwitch.label}
                                        </Label>
                                        <div className="relative">
                                            <ToggleSwitch
                                                checked={uiComponent.toggleSwitchResponse?.value}
                                                onChange={(value) => {
                                                    const copy = structuredClone(uiComponent);

                                                    copy.toggleSwitchResponse = copy.toggleSwitchResponse ?? {
                                                        id: '',
                                                        value: false,
                                                        toggleSwitchId: copy.toggleSwitch?.id,
                                                        submissionId: '',
                                                    };
                                                    copy.toggleSwitchResponse.value = value;

                                                    const list = structuredClone(uiComponents);
                                                    list[index] = copy;

                                                    setUIComponents(list);
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {uiComponent.button && (
                                    <div className={`w-full flex justify-center items-center py-2`}>
                                        <button
                                            type="button"
                                            className=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 focus:outline-none"
                                            onClick={() => {
                                                submit();
                                            }}>
                                            {uiComponent.button.label}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
