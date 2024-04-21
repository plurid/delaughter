// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';


    import {
        dewiki,
    } from '@plurid/plurid-themes';

    import {
        InputSwitch,
        Slider,
        LinkButton,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import {
        Options,
    } from '~data/interfaces';

    import {
        OPTIONS_KEY,
        defaultOptions,
    } from '~data/constants';

    import {
        getActiveTab,
    } from '~logic/utilities';
    // #endregion external


    // #region internal
    import {
        StyledPopup,
        inputStyle,
        sliderStyle,
    } from './styled';
    // #endregion internal
// #region imports



// #region module
export interface PopupProperties {
}

const Popup: React.FC<PopupProperties> = (
    _properties,
) => {
    // #region references
    const mounted = useRef(false);
    // #endregion references


    // #region state
    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        activated,
        setActivated,
    ] = useState(false);

    const [
        confidence,
        setConfidence,
    ] = useState(defaultOptions.confidence);

    const [
        laughterVolume,
        setLaughterVolume,
    ] = useState(defaultOptions.laughterVolume);
    // #endregion state


    // #region handlers
    const activate = async () => {
        try {
            setActivated(value => !value);
            const tab = await getActiveTab();
            await chrome.tabs.sendMessage(tab.id, {
                type: 'TOGGLE',
            });
        } catch (error) {
            return;
        }
    }

    const reset = () => {
        setConfidence(defaultOptions.confidence);
        setLaughterVolume(defaultOptions.laughterVolume);
    }
    // #endregion handlers


    // #region effects
    /** Load */
    useEffect(() => {
        const load = async () => {
            try {
                const data = await chrome.storage.local.get(OPTIONS_KEY);
                if (!data || !data[OPTIONS_KEY]) {
                    setLoading(false);
                    return;
                }

                const {
                    confidence,
                    laughterVolume,
                } = data[OPTIONS_KEY] as Options;

                setConfidence(confidence);
                setLaughterVolume(laughterVolume);

                setLoading(false);
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        load();
    }, []);

    /** Save */
    useEffect(() => {
        if (!mounted.current) {
            return;
        }

        const save = async () => {
            try {
                const options: Options = {
                    confidence,
                    laughterVolume,
                };

                await chrome.storage.local.set({
                    [OPTIONS_KEY]: options,
                });
            } catch (error) {
                return;
            }
        }

        save();
    }, [
        activated,
        confidence,
        laughterVolume,
    ]);

    /** Mount */
    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        }
    }, []);

    /** Tab Data */
    useEffect(() => {
        const getTabData = async () => {
            try {
                const tab = await getActiveTab();
                const response = await chrome.tabs.sendMessage(tab.id, {
                    type: 'GET_STATE',
                });
                if (!response) {
                    return;
                }

                const {
                    toggled,
                } = response;

                setActivated(!!toggled);
            } catch (error) {
                return;
            }
        }

        getTabData();
    }, []);
    // #endregion effects


    // #region render
    if (loading) {
        return (
            <StyledPopup
                theme={dewiki}
            >
            </StyledPopup>
        );
    }

    return (
        <StyledPopup
            theme={dewiki}
            style={{
                backgroundColor: activated ? 'black' : '#FF0000',
            }}
        >
            <h1>
                delaughter
            </h1>

            <div>
                press alt/option (⌥) + L on to turn on/off the laugh track
            </div>

            <InputSwitch
                name={`${activated ? 'deactivate' : 'activate'} [⌥ + L]`}
                checked={activated}
                atChange={() => {
                    activate();
                }}
                theme={dewiki}
                style={{
                    ...inputStyle,
                }}
            />

            <div
                style={{
                    ...sliderStyle,
                }}
            >
                <div>
                    confidence
                </div>

                <Slider
                    name="confidence"
                    value={confidence}
                    atChange={(value) => {
                        setConfidence(value);
                    }}
                    min={0.1}
                    max={1}
                    step={0.1}
                    width={150}
                    theme={dewiki}
                    level={2}
                />
            </div>

            {activated && (
                <>
                    <div
                        style={{
                            ...sliderStyle,
                        }}
                    >
                        <div>
                            laughter volume
                        </div>

                        <Slider
                            name="laughterVolume"
                            value={laughterVolume}
                            atChange={(value) => {
                                setLaughterVolume(value);
                            }}
                            min={0}
                            max={1}
                            step={0.1}
                            width={150}
                            theme={dewiki}
                            level={2}
                        />
                    </div>
                </>
            )}

            <div>
                <LinkButton
                    text="reset"
                    atClick={() => {
                        reset();
                    }}
                    theme={dewiki}
                    style={{
                        marginTop: '2rem',
                    }}
                    inline={true}
                />
            </div>
        </StyledPopup>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Popup;
// #endregion exports
