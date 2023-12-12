export const AndroidLinkLoginMissingApp = () => {
    return (
        <div
            className="flex m-2 p-2 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert">
            <svg
                className="flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div>
                <div className="font-medium">
                    We could not launch the app, please ensure that these requirements are met:
                </div>
                <ul className="mt-1.5 list-disc list-inside">
                    <li className="my-2">
                        Do have the app installed? Make sure that you installed the APK from our github repository
                    </li>
                    <li className="my-2">Make sure you are using Chrome browser.</li>
                </ul>
                <div className="font-medium mt-5">
                    If non of the above fixed the issue, please contact us. Sorry for inconvenience 🥲
                    <div className="m-2">
                        <div>
                            WhatsApp: <span>+358504762583</span>
                        </div>
                        <div>
                            Email: <span>mohamas@metropolia.fi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
