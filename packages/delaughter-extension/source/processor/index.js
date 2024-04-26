class DelaughterProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.threshold = 0.2;
    }

    process(inputs, outputs, parameters) {
        // const input = inputs[0];

        // const amplitude = input.reduce(
        //     (acc, channelData) => acc + channelData.reduce((acc, sample) => acc + Math.abs(sample), 0),
        //     0,
        // ) / input[0].length;

        // const laughterDetected = amplitude > this.threshold;

        // if (laughterDetected) {
        //     const output = outputs[0];
        //     output.forEach((channel) => {
        //         for (let i = 0; i < channel.length; i++) {
        //             channel[i] = 0;
        //         }
        //     });
        // } else {
        // }

        // this.muteDebug(outputs);

        return true;
    }

    muteDebug(outputs) {
        const output = outputs[0];
        output.forEach((channel) => {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = 0;
            }
        });
    }
}

registerProcessor('delaughter-processor', DelaughterProcessor);
