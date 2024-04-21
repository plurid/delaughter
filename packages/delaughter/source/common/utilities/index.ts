// #region imports
    // #region external
    import {
        IN_PRODUCTION,
    } from '~data/constants';
    // #endregion external
// #endregion imports



// #region module
export const log = (
    ...message: any[]
) => {
    if (IN_PRODUCTION) {
        return;
    }

    console.log('delaughter ::', ...message);
}
// #endregion module
