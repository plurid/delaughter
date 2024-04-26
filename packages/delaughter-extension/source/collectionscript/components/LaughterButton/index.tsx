import React from 'react';



export default function LaughterButton({
    isLaughing,
    setIsLaughing,
} : {
    isLaughing: boolean;
    setIsLaughing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <button
            style={{
                zIndex: 100000,
                position: 'absolute',
                top: '0',
                right: '0',
                padding: '15px',
                margin: '2x',
                fontSize: '1.5rem',
                backgroundColor: 'red',
                color: 'white',
                cursor: 'pointer',
                border: '1px solid black',
            }}
            onClick={() => {
                setIsLaughing(!isLaughing);
            }}
        >
            {isLaughing ? 'Laughter Stopped' : 'Laughter'}
        </button>
    );
}
