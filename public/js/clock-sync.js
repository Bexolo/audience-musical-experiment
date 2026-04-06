// NTP-style clock synchronization.
// Estimates the signed offset between client time and server time.
//
// offsetMs = avg(clientMidpoint - serverTime)
// To convert a server timestamp to client time: serverTs + offsetMs
// To convert client time to server time:         Date.now() - offsetMs

async function runClockSync(rounds = 8, discardWorst = 2) {
  const samples = [];

  for (let i = 0; i < rounds; i++) {
    try {
      const t0 = performance.now();
      const res = await fetch('/api/clock-sync');
      const t1 = performance.now();
      const { serverTime } = await res.json();

      const rtt = t1 - t0;
      // Assume server processed the request at the midpoint of the round-trip
      const clientMidpoint = t0 + rtt / 2;
      // Positive offset → client is ahead of server
      const offset = clientMidpoint - serverTime;
      samples.push({ rtt, offset });
    } catch (e) {
      // Skip failed rounds; will still average remaining samples
    }

    // Small gap between rounds to avoid Wi-Fi congestion
    if (i < rounds - 1) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  if (samples.length === 0) {
    console.warn('[clock-sync] All rounds failed, defaulting offset to 0');
    return { offsetMs: 0, rttMs: 0 };
  }

  // Discard highest-RTT samples (outliers)
  samples.sort((a, b) => a.rtt - b.rtt);
  const good = samples.slice(0, Math.max(1, samples.length - discardWorst));

  const avgOffset = good.reduce((s, x) => s + x.offset, 0) / good.length;
  const avgRtt    = good.reduce((s, x) => s + x.rtt,    0) / good.length;

  return { offsetMs: avgOffset, rttMs: avgRtt };
}
