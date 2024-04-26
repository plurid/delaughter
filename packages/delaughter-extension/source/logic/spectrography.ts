// #region imports
import {
    spectrogramColors,
} from '~data/constants/contentscript';
// #endregion imports



// #region module
export const renderSpectrogram = (
    audioContext: AudioContext,
    callback: (dataURL: string) => void,
    updateAnimationFrame: (frame: number) => void,
    checkToggle: () => boolean,
    canvasID: string = 'delaughter-spectrogram',
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
        const drawVisual = requestAnimationFrame(drawSpectrogram);
        updateAnimationFrame(drawVisual);

        if (!checkToggle() || !canvasCtx) {
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
        callback(dataURL);
    }

    drawSpectrogram();

    return analyser;
}
// #endregion module
