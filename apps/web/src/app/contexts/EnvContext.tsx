import { createContext } from 'react';

export const EnvContextDefaultValue = process.env.NODE_ENV === 'development' ? 'development' : 'production';

export const EnvContext = createContext<'development' | 'production'>(EnvContextDefaultValue);
