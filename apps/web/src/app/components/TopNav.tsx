import { Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const TopNav = () => {
    const [version, setVersion] = useState<string | null>(null);

    useEffect(() => {
        fetch('/version')
            .then((data) => data.text())
            .then((version) => setVersion(version))
            .catch((error) => setVersion('error getting version'));
    }, []);

    return (
        <div className=" shadow-md">
            <div className="mx-auto max-w-5xl flex items-center justify-between  px-2 py-6 gap-4">
                <div className="flex items-center gap-2">
                    {/*<div className="w-10 h-10 bgc rounded">Logo</div>*/}
                    <Link to={`/`} className="font-bold">
                        Draw2Form
                    </Link>
                    <small className="absolute top-0 left-1/2 text-gray-500 bg-transparent">{version}</small>
                </div>
            </div>
        </div>
    );
};
