const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ── Local IP detection ──────────────────────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// ── Device registry ─────────────────────────────────────────────────────────
const devices = new Map(); // socketId → { socketId, part, label, joinedAt, octave }
const VOICE_PARTS = ['Soprano', 'Alto', 'Tenor', 'Bass'];
let deviceCounter = 0;

// Assign the least-populated part (ties broken by VOICE_PARTS order)
function assignPart() {
  const counts = VOICE_PARTS.map(p => ({
    p,
    n: [...devices.values()].filter(d => d.part === p).length,
  }));
  const min = Math.min(...counts.map(x => x.n));
  return counts.find(x => x.n === min).p;
}

// Octave modifier: 0, +1, -1 cycling per part (only active when part >= 3 members)
function assignOctave(part) {
  const partDevices = [...devices.values()].filter(d => d.part === part);
  const count = partDevices.length; // count before adding new one
  if (count < 2) return 0;
  const cycle = [0, 1, -1];
  return cycle[count % cycle.length];
}

// Per-part gain scaling: softer as more devices join to avoid clipping
function computeGains() {
  const gains = {};
  for (const part of VOICE_PARTS) {
    const count = [...devices.values()].filter(d => d.part === part).length;
    gains[part] = Math.min(0.9, 0.8 / Math.sqrt(Math.max(1, count)));
  }
  return gains;
}

function deviceList() {
  return [...devices.values()];
}

function audienceSizeLabel() {
  const total = devices.size;
  if (total <= 4) return 'Chamber';
  if (total <= 20) return 'Small choir';
  if (total <= 80) return 'Full choir';
  return 'Mass choir';
}

// ── Performance state ────────────────────────────────────────────────────────
const state = {
  status: 'idle', // 'idle' | 'countdown' | 'playing' | 'stopped'
  playAt: null,
  countdownSec: 5,
};

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

// ── API: clock sync ──────────────────────────────────────────────────────────
app.get('/api/clock-sync', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ serverTime: Date.now() });
});

// ── API: QR code ─────────────────────────────────────────────────────────────
app.get('/api/qr', async (req, res) => {
  const localIP = getLocalIP();
  const url = `http://${localIP}:${PORT}/`;
  try {
    const svg = await qrcode.toString(url, { type: 'svg', margin: 1 });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// ── API: state snapshot (for host reconnect) ─────────────────────────────────
app.get('/api/state', (req, res) => {
  res.json({ devices: deviceList(), state, gains: computeGains() });
});

// ── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const role = socket.handshake.query.role;

  if (role === 'host') {
    // ── HOST connection ──
    socket.join('hosts');
    socket.emit('host:connected', {
      devices: deviceList(),
      state,
      gains: computeGains(),
      sizeLabel: audienceSizeLabel(),
    });

    socket.on('host:play', () => {
      if (state.status === 'playing' || state.status === 'countdown') return;
      state.playAt = Date.now() + state.countdownSec * 1000 + 500;
      state.status = 'countdown';
      io.emit('perf:countdown', { playAt: state.playAt, countdownSec: state.countdownSec });
      setTimeout(() => {
        if (state.status === 'countdown') {
          state.status = 'playing';
          io.emit('perf:play', { playAt: state.playAt });
        }
      }, state.countdownSec * 1000 + 600);
    });

    socket.on('host:stop', () => {
      state.status = 'stopped';
      state.playAt = null;
      io.emit('perf:stop', {});
    });

    socket.on('host:reset', () => {
      state.status = 'idle';
      state.playAt = null;
      io.emit('perf:reset', {});
    });

    // Host manually overrides gain for a part (overrides auto-scaling)
    socket.on('host:set-part-gain', ({ part, gain }) => {
      if (!VOICE_PARTS.includes(part)) return;
      const clampedGain = Math.max(0, Math.min(1, Number(gain) || 0));
      // Notify all clients of their part's updated gain
      for (const [sid, device] of devices) {
        if (device.part === part) {
          io.to(sid).emit('perf:gain-update', { [part]: clampedGain });
        }
      }
    });

    socket.on('host:assign-part', ({ socketId, part }) => {
      const device = devices.get(socketId);
      if (!device || !VOICE_PARTS.includes(part)) return;
      device.part = part;
      device.octave = assignOctave(part);
      const gains = computeGains();
      io.to('hosts').emit('device:joined', {
        devices: deviceList(),
        gains,
        sizeLabel: audienceSizeLabel(),
      });
      io.to(socketId).emit('perf:part-changed', {
        part: device.part,
        octave: device.octave,
        gain: gains[device.part],
      });
    });

    return;
  }

  // ── AUDIENCE CLIENT connection ──
  deviceCounter += 1;
  const part = assignPart();
  const octave = assignOctave(part);
  const label = `Device ${deviceCounter}`;

  devices.set(socket.id, {
    socketId: socket.id,
    part,
    label,
    joinedAt: Date.now(),
    octave,
  });

  const gains = computeGains();

  socket.emit('client:connected', {
    part,
    label,
    octave,
    gain: gains[part],
    // If a performance is in progress, send current state so late joiners can sync
    state: state.status !== 'idle' ? state : null,
  });

  io.to('hosts').emit('device:joined', {
    devices: deviceList(),
    gains,
    sizeLabel: audienceSizeLabel(),
  });

  // Broadcast updated gains to all clients when the roster changes
  socket.broadcast.emit('perf:gain-update', gains);

  socket.on('disconnect', () => {
    devices.delete(socket.id);
    const updatedGains = computeGains();
    io.to('hosts').emit('device:left', {
      devices: deviceList(),
      gains: updatedGains,
      sizeLabel: audienceSizeLabel(),
    });
    socket.broadcast.emit('perf:gain-update', updatedGains);
  });
});

// ── Start server ─────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('');
  console.log('  🎵 Audience Choir');
  console.log('  ─────────────────────────────────────');
  console.log(`  Host page:    http://${localIP}:${PORT}/host`);
  console.log(`  Client URL:   http://${localIP}:${PORT}/`);
  console.log('  ─────────────────────────────────────');
  console.log('  Show the host page on a projector.');
  console.log('  Audience scans the QR code to join.');
  console.log('');
});
