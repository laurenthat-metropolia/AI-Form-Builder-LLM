import { Outlet, Link } from 'react-router-dom';

export const TopNav = () => {
    return (
        <div className=" shadow-md">
            <div className="mx-auto max-w-5xl flex items-center justify-between  px-2 py-6 gap-4">
                <div className="flex items-center gap-2">
                    {/*<div className="w-10 h-10 bgc rounded">Logo</div>*/}
                    <h1>Draw2form</h1>
                </div>
                <Link to={`/upload`}>Upload</Link>
            </div>
        </div>
    );
};
