import React, {
    useRef,
    useState,
    useEffect,
} from 'react';

import LaughterButton from '../LaughterButton';
import SpectrogramsSelector from '../SpectrogramsSelector';

import {
    renderSpectrogram,
} from '~logic/spectrography';

import {
    getPageVideo,
} from '~logic/utilities';



export default function App() {
    // #region references
    const drawVisualRef = useRef<number | null>(null);
    // #endregion references


    // #region state
    const [
        isLaughing,
        setIsLaughing,
    ] = useState(false);

    const [
        spectrogramsBuffer,
        setSpectrogramsBuffer,
    ] = useState<string[]>([]);
    // #endregion state


    // #region effects
    useEffect(() => {
        const video = getPageVideo();
        if (!video) {
            return;
        }

        if (!isLaughing) {
            if (drawVisualRef.current) {
                cancelAnimationFrame(drawVisualRef.current);
                drawVisualRef.current = null;
            }

            video.pause();

            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sourceNode = audioContext.createMediaElementSource(video);
        const gainNode = audioContext.createGain();

        const analyser = renderSpectrogram(
            audioContext,
            (dataURL) => {
                setSpectrogramsBuffer((data) => ([
                    ...data,
                    dataURL,
                ]));
            },
            (frame) => {
                drawVisualRef.current = frame;
            },
            () => isLaughing,
        );

        sourceNode.connect(analyser);
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
    }, [
        isLaughing,
    ]);
    // #endregion effects


    return (
        <div className="App">
            <LaughterButton
                isLaughing={isLaughing}
                setIsLaughing={setIsLaughing}
            />

            <SpectrogramsSelector
                spectrogramsBuffer={spectrogramsBuffer}
                setSpectrogramsBuffer={setSpectrogramsBuffer}
            />
        </div>
    );
}
