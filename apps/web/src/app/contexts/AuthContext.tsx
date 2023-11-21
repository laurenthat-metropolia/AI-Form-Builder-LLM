import { createContext } from 'react';
import { LoginInformation, safeParse } from '@draw2form/shared';

export const GetAuthContextDefaultValue = () => safeParse(localStorage.getItem('draw2form'));
export const AuthContext = createContext<[LoginInformation | null, (data: LoginInformation | null) => void]>([
    GetAuthContextDefaultValue(),
    (data) => {},
]);
