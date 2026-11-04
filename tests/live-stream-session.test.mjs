import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LiveStreamSession } from '../src/lib/liveStreamSession.ts';
const flush = () => new Promise(resolve => setImmediate(resolve));

test('Closing an active stream sends exactly one stop command', async () => {
  const calls = [];
  const session = new LiveStreamSession(async (url, init) => { calls.push({ url, init }); return new Response(null, { status: 200 }); });
  let started = false;
  const close = session.open('camera-1', 1, () => { started = true; }, assert.fail);
  await flush(); assert.equal(started, true);
  close(); close(); await flush();
  assert.deepEqual(calls.map(c => c.url), ['/api/dashcams/camera-1/stream/start?channel=1', '/api/dashcams/camera-1/stream/stop?channel=1']);
  assert.equal(calls[1].init.keepalive, true);
});

test('Close while starting waits for the start response before stopping and reopening', async () => {
  let resolveStart;
  const calls = [];
  const session = new LiveStreamSession(async (url) => {
    calls.push(url);
    if (calls.length === 1) return new Promise(resolve => { resolveStart = resolve; });
    return new Response(null, { status: 200 });
  });
  let oldStarted = false, newStarted = false;
  const close = session.open('camera-1', 1, () => { oldStarted = true; }, assert.fail);
  await flush(); close();
  const closeNew = session.open('camera-1', 1, () => { newStarted = true; }, assert.fail);
  await flush(); assert.equal(calls.length, 1);
  resolveStart(new Response(null, { status: 200 })); await flush();
  assert.equal(oldStarted, false); assert.equal(newStarted, true);
  assert.deepEqual(calls.map(c => c.split('/').at(-1)), ['start?channel=1', 'stop?channel=1', 'start?channel=1']);
  closeNew(); await flush();
});

test('Immediate close sends no camera commands', async () => {
  let count = 0;
  const session = new LiveStreamSession(async () => { count++; return new Response(); });
  session.open('camera-1', 1, assert.fail, assert.fail)(); await flush();
  assert.equal(count, 0);
});

test('Rejected start reports the server message without marking the stream live', async () => {
  let message;
  const session = new LiveStreamSession(async () => Response.json({ message: 'Camera offline' }, { status: 409 }));
  session.open('camera-1', 2, assert.fail, error => { message = error.message; }); await flush();
  assert.equal(message, 'Camera offline');
});


test('Default transport calls browser fetch with its global receiver for start and stop', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async function (url, init) {
    assert.equal(this, globalThis, 'fetch requires the browser global receiver');
    calls.push({ url, init });
    return new Response(null, { status: 200 });
  };
  try {
    let started = false;
    const session = new LiveStreamSession();
    const close = session.open('camera-browser', 1, () => { started = true; }, assert.fail);
    await flush();
    assert.equal(started, true);
    close(); await flush();
    assert.deepEqual(calls.map(call => call.url.split('/').at(-1)), ['start?channel=1', 'stop?channel=1']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
