// #region imports
import {
    Options,
} from '~data/interfaces';

import {
    OPTIONS_KEY,
    defaultOptions,
} from '~data/constants';

import {
    spectrogramColors,
} from '~data/constants/contentscript';
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

const canvasID = 'delaughter-spectrogram';


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
        // const laughing = LaughingNetwork(spectrogram);
        // if (laughing) {
        //     this.laughing();
        // } else {
        //     this.notLaughing();
        // }
    }
}


let laughing = false;

const uploadData = (
    dataURL: string,
) => {
    if (!laughing) {
        return;
    }

    const url = 'http://localhost:9199/api/v1/file/';

    const data = new FormData();

    const byteCharacters = atob(dataURL.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // const blob = new Blob([dataURL], {type : 'text/plain'});
    // data.append('file', blob, 'file.txt')

    data.append('file', blob, 'file.png')

    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: data,
    });
}


const renderSpectrogram = (
    audioContext: AudioContext,
    delaughter: Delaughter,
) => {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const WIDTH = 650;
    const HEIGHT = 650;
    const canvas = document.createElement('canvas');
    canvas.id = canvasID;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '100000';
    const canvasCtx = canvas.getContext('2d');

    function drawSpectrogram() {
        drawVisual = requestAnimationFrame(drawSpectrogram);

        if (!toggled || !canvasCtx) {
            return;
        }

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0 0 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        for (let i = 0; i < dataArray.length; i++) {
            canvasCtx.fillStyle = (spectrogramColors as any)[dataArray[i] + ''];

            canvasCtx.fillRect(i * 10, HEIGHT - dataArray[i], 10, 10);

            const size = 20;
            canvasCtx.fillRect(
                Math.floor(i / size) * size,
                (i % size) * size,
                size,
                size,
            );
        }

        const dataURL = canvas.toDataURL();
        delaughter.check(dataURL);

        uploadData(dataURL);
    }

    drawSpectrogram();

    // document.body.appendChild(canvas);

    return analyser;
}

const renderButton = () => {
    const button = document.createElement('button');
    button.innerHTML = 'Laughter';
    button.style.position = 'absolute';
    button.style.top = '0';
    button.style.right = '0';
    button.style.zIndex = '100000';
    button.style.padding = '20px';
    button.style.margin = '20px';
    button.style.fontSize = '20px';
    button.style.backgroundColor = 'slategray';
    button.style.color = 'white';
    button.style.cursor = 'pointer';

    button.onclick = () => {
        if (laughing) {
            laughing = false;
            button.innerHTML = 'Laughter';
        } else {
            laughing = true;
            button.innerHTML = 'No Laughter';
        }
    };
    document.body.appendChild(button);
}

const applyDelaughter = async (
    options: Options,
) => {
    const video = document.getElementsByTagName('video')[0];
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

    const analyser = renderSpectrogram(audioContext, delaughter);

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

    const canvas = document.getElementById(canvasID);
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


renderButton();



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
