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
                position: 'absolute',
                top: '0',
                right: '0',
                zIndex: '100000',
                padding: '20px',
                margin: '20px',
                fontSize: '20px',
                backgroundColor: 'slategray',
                color: 'white',
                cursor: 'pointer',
            }}
            onClick={() => {
                setIsLaughing(!isLaughing);
            }}
        >
            {isLaughing ? 'Laughter Stopped' : 'Laughter'}
        </button>
    );
}
