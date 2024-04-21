class DelaughterProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        this.muteDebug(outputs);

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
