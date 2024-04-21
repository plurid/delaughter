// #region imports
import {
    Options,
} from '~data/interfaces';

import {
    OPTIONS_KEY,
    defaultOptions,
} from '~data/constants';
// #endregion imports



// #region module
let toggled = false;
let options = defaultOptions;

let sourceNode: MediaElementAudioSourceNode | null;
let gainNode: GainNode | null;
let delaughterNode: AudioWorkletNode | null;
let audioContext: AudioContext | null;

const applyDelaughter = async (
    options: Options,
) => {
    const video = document.getElementsByTagName('video')[0];

    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!sourceNode) {
        sourceNode = audioContext.createMediaElementSource(video);
    }
    if (gainNode) {
        gainNode.disconnect();
    }
    gainNode = audioContext.createGain();

    const processorURL = chrome.runtime.getURL('processor.js');
    await audioContext.audioWorklet.addModule(processorURL);
    delaughterNode = new AudioWorkletNode(
        audioContext,
        'delaughter-processor',
    );
    delaughterNode.connect(gainNode);

    sourceNode.connect(delaughterNode);
    gainNode.connect(audioContext.destination);
}

const cleanupDelaughter = () => {
    if (!audioContext
        || !sourceNode
        || !gainNode
        || !delaughterNode
    ) {
        return;
    }

    delaughterNode.disconnect();
    delaughterNode = null;

    gainNode.disconnect();
    gainNode = audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
}

const toggleDelaughter = async (
    options: Options,
) => {
    cleanupDelaughter();

    if (!toggled) {
        applyDelaughter(options);
    }

    toggled = !toggled;
}



const main = async () => {
    try {
        const optionsRequest = await chrome.storage.local.get(OPTIONS_KEY);
        if (optionsRequest && optionsRequest[OPTIONS_KEY]) {
            options = optionsRequest[OPTIONS_KEY];
        }

        document.addEventListener('keydown', (event) => {
            try {
                if (event.altKey && event.code === 'KeyL') {
                    toggleDelaughter(options);
                    return;
                }
            } catch (error) {
                return;
            }
        });

        chrome.storage.onChanged.addListener((changes) => {
            try {
                const newOptions = changes[OPTIONS_KEY].newValue as Options;
                if (!newOptions) {
                    return;
                }

                options = newOptions;
                cleanupDelaughter();
            } catch (error) {
                return;
            }
        });

        chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
            try {
                switch (message.type) {
                    case 'TOGGLE':
                        toggleDelaughter(options);
                        break;
                    case 'GET_STATE':
                        sendResponse({
                            toggled,
                        });
                        break;
                }
            } catch (error) {
                return;
            }
        });
    } catch (error) {
        return;
    }
}

main().catch(() => {});
// #endregion module
