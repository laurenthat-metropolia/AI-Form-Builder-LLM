// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Outlet } from 'react-router-dom';
import { TopNav } from './components/TopNav';
import { AuthContext, GetAuthContextDefaultValue } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
import { LoginInformation } from '@draw2form/shared';
import { EnvContext, EnvContextDefaultValue } from './contexts/EnvContext';

function App() {
    const [auth, setAuth] = useState<LoginInformation | null>(GetAuthContextDefaultValue());
    const [env] = useState<'development' | 'production'>(EnvContextDefaultValue);

    useEffect(() => {}, [auth]);
    return (
        <EnvContext.Provider value={env}>
            <AuthContext.Provider
                value={[
                    auth,
                    (loginInfo) => {
                        if (!loginInfo) {
                            localStorage.removeItem('draw2form');
                        } else {
                            localStorage.setItem('draw2form', JSON.stringify(loginInfo));
                        }
                        setAuth(loginInfo);
                    },
                ]}>
                <TopNav />
                <Outlet></Outlet>
            </AuthContext.Provider>
        </EnvContext.Provider>
    );
}

export default App;
