import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { EnvContext } from '../contexts/EnvContext';

export const TopNav = () => {
    const [version, setVersion] = useState<string | null>(null);
    const [loginInformation, setLoginInformation] = useContext(AuthContext);
    const env = useContext(EnvContext);
    const [loginUrl] = useState(env === 'development' ? `http://localhost:8000/api/auth/google` : `/api/auth/google`);

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
                    {loginInformation && <Link to="/forms">Forms</Link>}
                </div>
                <div>
                    {loginInformation === null && (
                        <a href={loginUrl} className="font-bold">
                            Login
                        </a>
                    )}
                    {loginInformation !== null && (
                        <div className="flex items-center gap-2">
                            <img
                                alt="profile"
                                src={loginInformation.user.picture ?? ''}
                                className="object-cover rounded-full h-8 w-8 text-sm "
                            />
                            <span>{loginInformation.user.name}</span>
                            <button onClick={() => setLoginInformation(null)}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
