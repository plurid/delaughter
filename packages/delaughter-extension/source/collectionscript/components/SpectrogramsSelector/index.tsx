import React, {
    useState,
} from 'react';

import {
    Slider,
} from '@plurid/plurid-ui-components-react';



const FormLine = ({
    children,
} : {
    children: React.ReactNode;
}) => {
    return (
        <div
            style={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'center',
                gap: '2rem',
                margin: '1rem',
            }}
        >
            {children}
        </div>
    );
}


export default function SpectrogramsSelector({
    spectrogramsBuffer,
    setSpectrogramsBuffer,
} : {
    spectrogramsBuffer: string[];
    setSpectrogramsBuffer: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    const [
        currentSpectrogramIndex,
        setCurrentSpectrogramIndex,
    ] = useState(0);


    const uploadData = (
        dataURL: string,
    ) => {
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


    if (spectrogramsBuffer.length === 0) {
        return (<></>);
    }

    return (
        <div
            style={{
                backgroundColor: 'red',
                padding: '20px',
                border: '1px solid black',
            }}
        >
            <div
                style={{
                    fontSize: '1.5rem',
                    textAlign: 'center',
                }}
            >
                {currentSpectrogramIndex} / {spectrogramsBuffer.length - 1} spectrograms
            </div>

            <img
                style={{
                    display: 'block',
                    margin: '1rem',
                    border: '1px solid black',
                    height: '400px',
                    width: '400px',
                }}
                src={spectrogramsBuffer[currentSpectrogramIndex]}
            />

            <FormLine>
                <button
                    onClick={() => {
                        setCurrentSpectrogramIndex((currentSpectrogramIndex - 1 + spectrogramsBuffer.length) % spectrogramsBuffer.length);
                    }}
                >
                    Previous
                </button>

                <button
                    onClick={() => {
                        setCurrentSpectrogramIndex((currentSpectrogramIndex + 1) % spectrogramsBuffer.length);
                    }}
                >
                    Next
                </button>
            </FormLine>

            <FormLine>
                <Slider
                    name="current spectrogram"
                    value={currentSpectrogramIndex}
                    atChange={(value) => {
                        setCurrentSpectrogramIndex(value);
                    }}
                    min={0}
                    max={spectrogramsBuffer.length - 1}
                    step={1}
                    width={400}
                    level={2}
                />
            </FormLine>

            <FormLine>
                <button
                    onClick={() => {
                        const newSpectrogramsBuffer = [
                            ...spectrogramsBuffer,
                        ];
                        newSpectrogramsBuffer.splice(currentSpectrogramIndex, 1);

                        setSpectrogramsBuffer(newSpectrogramsBuffer);

                        if (currentSpectrogramIndex >= newSpectrogramsBuffer.length) {
                            setCurrentSpectrogramIndex(newSpectrogramsBuffer.length - 1);
                        }
                    }}
                >
                    Remove Spectrogram
                </button>
            </FormLine>

            <FormLine>
                {/* trim left - right  */}
                <div>
                    trimming
                </div>
            </FormLine>

            <FormLine>
                <button
                    onClick={() => {
                        setCurrentSpectrogramIndex(0);
                        setSpectrogramsBuffer([]);
                    }}
                >
                    Cancel
                </button>

                <button>
                    Upload
                </button>
            </FormLine>
        </div>
    );
}
