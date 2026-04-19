export class AudioProcessor {
    private audioContext: AudioContext | null = null;
    public processor: ScriptProcessorNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private stream: MediaStream | null = null;
    private destination: MediaStreamAudioDestinationNode | null = null;

    constructor(audioContext?: AudioContext) {
        if (audioContext) {
            this.audioContext = audioContext;
        }
    }

    async start(onAudioData: (base64Data: string) => void) {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
        }
        
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.destination = this.audioContext.createMediaStreamDestination();

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        
        // Also connect source to our destination for combined recording
        this.source.connect(this.destination);

        this.processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);
            const pcmData = this.floatTo16BitPCM(inputData);
            onAudioData(this.arrayBufferToBase64(pcmData));
        };
    }

    stop() {
        this.processor?.disconnect();
        this.processor = null;
        this.source?.disconnect();
        this.source = null;
        this.stream?.getTracks().forEach((track) => track.stop());
        this.stream = null;
        this.destination = null;
        // Don't close audioContext if it might be shared
    }

    getStream() {
        return this.stream;
    }

    getCombinedStream() {
        return this.destination?.stream;
    }

    getAudioContext() {
        return this.audioContext;
    }

    getDestination() {
        return this.destination;
    }

    private floatTo16BitPCM(input: Float32Array) {
        const buffer = new ArrayBuffer(input.length * 2);
        const view = new DataView(buffer);

        for (let i = 0; i < input.length; i++) {
            const sample = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        }

        return buffer;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);

        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary);
    }
}

export class AudioPlayer {
    private audioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private destination: AudioNode | null = null;

    constructor(audioContext?: AudioContext, destination?: AudioNode) {
        this.audioContext = audioContext || new AudioContext({ sampleRate: 24000 });
        this.destination = destination || null;
    }

    async playChunk(base64Data: string) {
        if (!this.audioContext) return;

        const binary = window.atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const pcmData = new Int16Array(bytes.buffer);
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            floatData[i] = pcmData[i] / 0x8000;
        }

        const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 24000);
        audioBuffer.getChannelData(0).set(floatData);

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        
        // Also connect to combined destination if provided
        if (this.destination) {
            source.connect(this.destination);
        }

        const currentTime = this.audioContext.currentTime;
        if (this.nextStartTime < currentTime) {
            this.nextStartTime = currentTime;
        }

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
    }

    stop() {
        // We don't want to close the shared context, just reset timing
        this.nextStartTime = 0;
    }
}
