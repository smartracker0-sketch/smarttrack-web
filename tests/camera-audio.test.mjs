import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAdts } from '../src/lib/cameraAudio.ts';

test('ADTS carries the actual AAC profile, sample rate and channel configuration', () => {
  const header = new Uint8Array([0xff, 0xf1, 0x6c, 0x40, 0x01, 0x3f, 0xfc, 0xaa, 0xbb]);
  const frame = parseAdts(header);
  assert.equal(frame.profile, 2); assert.equal(frame.sampleRate, 8000); assert.equal(frame.channels, 1);
  assert.deepEqual([...frame.payload], [0xaa, 0xbb]); assert.deepEqual([...frame.description], [0x15, 0x88]);
});
test('Missing headers and truncated AAC frames are rejected rather than played at a guessed sample rate', () => {
  assert.throws(() => parseAdts(new Uint8Array([1, 2, 3])), /ADTS/);
  assert.throws(() => parseAdts(new Uint8Array([0xff, 0xf1, 0x6c, 0x40, 0x01, 0x3f, 0xfc, 0xaa])), /Invalid/);
});

test('A delayed audio backlog cancels old queued sound instead of overlapping live audio', async () => {
  const original = globalThis.AudioContext;
  const sources = [];
  let closed = false, closeCalls = 0;
  globalThis.AudioContext = class {
    currentTime = 0; destination = {};
    async resume() {}
    async close() { closed = true; closeCalls++; }
    createBuffer(_channels, length, rate) { return { duration: length / rate, getChannelData: () => new Float32Array(length) }; }
    createBufferSource() { const source = { stopped: false, buffer: null, onended: null, connect() {}, disconnect() {}, start() {}, stop() { this.stopped = true; } }; sources.push(source); return source; }
  };
  try {
    const { CameraAudioPlayer } = await import('../src/lib/cameraAudio.ts');
    const player = new CameraAudioPlayer(assert.fail);
    await player.start();
    for (let i = 0; i < 20; i++) player.feed({ sequence: i, timestamp: i, encoding: 'pcm_s16le', data: Buffer.alloc(1900).toString('base64') });
    assert.equal(sources[0].stopped, true); assert.equal(sources.at(-1).stopped, false);
    player.stop(); player.stop(); assert.equal(sources.at(-1).stopped, true); assert.equal(closed, true); assert.equal(closeCalls, 1);
  } finally { globalThis.AudioContext = original; }
});
