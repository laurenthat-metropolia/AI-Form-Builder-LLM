import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AndroidLoginIntentBody, safeParse } from '@draw2form/shared';

export const AndroidLaunchForLogin = () => {
    const [params] = useSearchParams();

    const [user] = useState<AndroidLoginIntentBody['user'] | null>(safeParse(params.get('user')));
    const [token] = useState<AndroidLoginIntentBody['token'] | null>(safeParse(params.get('token')));
    const [showToken, setShowToken] = useState<boolean>(false);
    const [link, setLink] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !token) {
            return;
        }

        const params = new URLSearchParams();
        const loginInfo: AndroidLoginIntentBody = {
            user,
            token,
        };
        for (let [key, value] of Object.entries(loginInfo)) {
            params.set(key, JSON.stringify(value));
        }

        setLink(`/android/auth/login?${params.toString()}`);
    }, [user, token]);

    return (
        <div>
            <div>
                <div className="w-screen flex items-center justify-center flex-col gap-4 overflow-visible pt-[10vh]">
                    <div className="w-24 h-24 bgc rounded mb-10"></div>
                    <a
                        href={link ?? undefined}
                        className="px-4 py-2 text-white bg-indigo-600 rounded duration-150 hover:bg-indigo-500 active:bg-indigo-700">
                        Launch LinkUp
                    </a>

                    <button
                        onClick={() => {
                            setShowToken(!showToken);
                        }}
                        type="button"
                        className="mt-[10rem] py-2 px-4 flex gap-2 justify-center items-center  bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                        <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M24.9994 14.1064C24.976 14.9575 24.2564 15.625 23.405 15.625H20.7031V16.4062C20.7031 17.4738 20.4647 18.4855 20.039 19.3918L22.9799 22.3327C23.59 22.9429 23.59 23.9322 22.9799 24.5424C22.3696 25.1526 21.3803 25.1525 20.7701 24.5424L18.0974 21.8697C16.8889 22.8499 15.3491 23.4375 13.6718 23.4375V11.5234C13.6718 11.1999 13.4095 10.9375 13.0859 10.9375H11.914C11.5904 10.9375 11.3281 11.1999 11.3281 11.5234V23.4375C9.6508 23.4375 8.111 22.8499 6.90251 21.8697L4.22985 24.5424C3.6196 25.1526 2.63029 25.1525 2.02009 24.5424C1.40993 23.9322 1.40993 22.9429 2.02009 22.3327L4.96091 19.3918C4.53522 18.4855 4.29685 17.4738 4.29685 16.4062V15.625H1.59499C0.743623 15.625 0.0239451 14.9575 0.000605272 14.1064C-0.0236623 13.2234 0.684931 12.5 1.56247 12.5H4.29685V9.63159L2.02009 7.35483C1.40993 6.74463 1.40993 5.75532 2.02009 5.14512C2.63034 4.53491 3.6196 4.53491 4.22985 5.14512L6.89719 7.8125H18.1027L20.77 5.14517C21.3803 4.53496 22.3696 4.53496 22.9798 5.14517C23.59 5.75537 23.59 6.74468 22.9798 7.35488L20.7031 9.63159V12.5H23.4375C24.315 12.5 25.0236 13.2234 24.9994 14.1064ZM12.5488 0C9.52849 0 7.08005 2.44844 7.08005 5.46875H18.0175C18.0175 2.44844 15.5691 0 12.5488 0Z"
                                fill="white"
                            />
                        </svg>
                        Show my access token
                    </button>
                    {showToken && (
                        <div id="token" className="select-all max-w-xs mx-auto break-all">
                            {token?.accessToken}
                        </div>
                    )}
                    <div className="pt-10 flex flex-col gap-2 items-center">
                        <span>Or download from</span>
                        <div className="flex gap-2 items-center">
                            <img src="/appstore.svg" alt="appstore.svg" />
                            <img src="/googleplay.svg" alt="googleplay.svg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
