// #region imports
    // #region external
    import {
        Options,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export const IN_PRODUCTION = process.env.NODE_ENV === 'production';


export const defaultOptions: Options = {
    confidence: 1,
    laughterVolume: 0,
};


export const OPTIONS_KEY = 'delaughterOptions';
// #endregion module
