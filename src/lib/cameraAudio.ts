export type CameraAudioChunk = { sequence: number; timestamp: number; encoding: string; data: string };
type DecodedAudio = { sampleRate: number; numberOfChannels: number; numberOfFrames: number; copyTo(destination: Float32Array, options: { planeIndex: number; format: string }): void; close(): void };
type Decoder = { configure(config: object): void; decode(chunk: object): void; close(): void };
type Codecs = { AudioDecoder?: new (callbacks: { output(frame: DecodedAudio): void; error(error: Error): void }) => Decoder; EncodedAudioChunk?: new (chunk: object) => object };

export function parseAdts(bytes: Uint8Array) {
  if (bytes.length < 7 || bytes[0] !== 255 || (bytes[1] & 246) !== 240) throw new Error("The camera’s AAC audio is missing an ADTS header. A vendor audio sample is needed for this format.");
  const profile = (bytes[2] >> 6) + 1, frequency = (bytes[2] >> 2) & 15, channels = ((bytes[2] & 1) << 2) | (bytes[3] >> 6);
  const sampleRate = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350][frequency];
  const length = ((bytes[3] & 3) << 11) | (bytes[4] << 3) | (bytes[5] >> 5), header = (bytes[1] & 1) ? 7 : 9;
  if (!sampleRate || !channels || length > bytes.length || length <= header) throw new Error("Invalid camera AAC audio frame");
  return { profile, sampleRate, channels, length, payload: bytes.slice(header, length), description: new Uint8Array([(profile << 3) | (frequency >> 1), ((frequency & 1) << 7) | (channels << 3)]) };
}

export class CameraAudioPlayer {
  private context: AudioContext;
  private next = 0;
  private decoder: Decoder | null = null;
  private aacTime = 0;
  private stopped = false;
  private sources = new Set<AudioBufferSourceNode>();
  private onError: (error: Error) => void;
  constructor(onError: (error: Error) => void) { this.onError = onError; this.context = new AudioContext(); }
  async start() { await this.context.resume(); }
  stop() { if (this.stopped) return; this.stopped = true; for (const source of this.sources) { try { source.stop(); } catch { /* Already ended. */ } } this.sources.clear(); try { this.decoder?.close(); } catch { /* A decoder error may already have closed it. */ } void this.context.close().catch(() => {}); }
  feed(chunk: CameraAudioChunk) {
    if (this.stopped) return;
    const bytes = Uint8Array.from(atob(chunk.data), c => c.charCodeAt(0));
    if (chunk.encoding === "pcm_s16le") {
      if (bytes.length % 2) throw new Error("Invalid PCM camera audio");
      const buffer = this.context.createBuffer(1, bytes.length / 2, 8000), samples = buffer.getChannelData(0), view = new DataView(bytes.buffer);
      for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
      this.play(buffer); return;
    }
    if (chunk.encoding !== "aac") throw new Error("Unsupported camera audio encoding");
    const codecs = window as unknown as Codecs;
    if (!codecs.AudioDecoder || !codecs.EncodedAudioChunk) throw new Error("This browser cannot decode camera AAC audio. Try a browser with WebCodecs audio support.");
    let offset = 0;
    while (offset < bytes.length) {
      const frame = parseAdts(bytes.slice(offset)); offset += frame.length;
      if (!this.decoder) {
        this.decoder = new codecs.AudioDecoder({ output: audio => {
          try { if (this.stopped) return; const buffer = this.context.createBuffer(audio.numberOfChannels, audio.numberOfFrames, audio.sampleRate); for (let i = 0; i < audio.numberOfChannels; i++) audio.copyTo(buffer.getChannelData(i), { planeIndex: i, format: "f32-planar" }); this.play(buffer); } finally { audio.close(); }
        }, error: this.onError });
        this.decoder.configure({ codec: `mp4a.40.${frame.profile}`, sampleRate: frame.sampleRate, numberOfChannels: frame.channels, description: frame.description });
      }
      this.decoder.decode(new codecs.EncodedAudioChunk({ type: "key", timestamp: this.aacTime, data: frame.payload })); this.aacTime += 1024 / frame.sampleRate * 1_000_000;
    }
  }
  private play(buffer: AudioBuffer) {
    if (this.stopped) return;
    if (this.next > this.context.currentTime + 2) { for (const queued of this.sources) { try { queued.stop(); } catch { /* Already ended. */ } } this.sources.clear(); this.next = 0; }
    const source = this.context.createBufferSource(); source.buffer = buffer; source.connect(this.context.destination);
    if (this.next < this.context.currentTime) this.next = this.context.currentTime + 0.05;
    source.onended = () => { this.sources.delete(source); source.disconnect(); }; source.start(this.next); this.sources.add(source); this.next += buffer.duration;
  }
}
