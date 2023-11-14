import { Outlet, Link } from 'react-router-dom';

export const TopNav = () => {
    return (
        <div className="flex items-center justify-between p-2 gap-4 shadow-md">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bgc rounded">Logo</div>
                <h1>Draw2form</h1>
            </div>
            <Link to={`/upload`}>Upload</Link>
        </div>
    );
};
