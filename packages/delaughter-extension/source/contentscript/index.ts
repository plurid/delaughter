// #region imports
import {
    Options,
} from '~data/interfaces';

import {
    spectrogramCanvasID,
} from '~data/constants/contentscript';

import {
    OPTIONS_KEY,
    defaultOptions,
} from '~data/constants';

import {
    renderSpectrogram,
} from '~logic/spectrography';

import {
    getPageVideo,
} from '~logic/utilities';
// #endregion imports



// #region module
let toggled = false;
let options = defaultOptions;

let sourceNode: MediaElementAudioSourceNode | null;
let gainNode: GainNode | null;
let delaughterNode: AudioWorkletNode | null;
let audioContext: AudioContext | null;
let drawVisual: number | null;
let delaughter: Delaughter | null = null;



const checkLaughingNetwork = (
    spectrogram: string,
) => {
    return false;
}


class Delaughter {
    private gainNode: GainNode;

    constructor(
        gainNode: GainNode,
    ) {
        this.gainNode = gainNode;
    }

    private laughing() {
        if (!this.gainNode) {
            return;
        }
        if (this.gainNode.gain.value === 0) {
            return;
        }
        this.gainNode.gain.value = 0;
    }

    private notLaughing() {
        if (!this.gainNode) {
            return;
        }
        if (this.gainNode.gain.value === 1) {
            return;
        }
        this.gainNode.gain.value = 1;
    }

    public check(spectrogram: string) {
        const laughing = checkLaughingNetwork(spectrogram);
        // if (laughing) {
        //     this.laughing();
        // } else {
        //     this.notLaughing();
        // }
    }
}


const applyDelaughter = async (
    options: Options,
) => {
    const video = getPageVideo();
    if (!video) {
        return;
    }

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

    delaughter = new Delaughter(gainNode);

    const analyser = renderSpectrogram(
        audioContext,
        (spectrogram) => {
            delaughter.check(spectrogram);
        },
        (frame) => {
            drawVisual = frame;
        },
        () => toggled,
    );

    // const processorURL = chrome.runtime.getURL('processor.js');
    // await audioContext.audioWorklet.addModule(processorURL);
    // delaughterNode = new AudioWorkletNode(
    //     audioContext,
    //     'delaughter-processor',
    // );
    // delaughterNode.connect(gainNode);

    // sourceNode.connect(delaughterNode);
    sourceNode.connect(analyser);
    sourceNode.connect(gainNode);
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

    cancelAnimationFrame(drawVisual);

    delaughterNode.disconnect();
    delaughterNode = null;

    gainNode.disconnect();
    gainNode = audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const canvas = document.getElementById(spectrogramCanvasID);
    if (canvas) {
        canvas.remove();
    }
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
