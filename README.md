# Audience Choir

A live-event experiment that turns the audience's phones into a distributed choir. Each device joining the room is automatically assigned a voice part (Soprano, Alto, Tenor, or Bass) and plays its part in sync when the host triggers playback.

## How it works

1. The host opens `/host` on a laptop connected to a projector.
2. A QR code is displayed — audience members scan it to join.
3. Each device is auto-assigned a balanced voice part.
4. The host selects a song and hits **Play**. All devices count down and start in sync.

## Features

- **Auto voice balancing** — new devices are assigned to the least-populated part (SATB).
- **Octave variation** — once a part has 3+ members, devices cycle through 0 / +1 / -1 octave offsets for richer texture.
- **Dynamic gain scaling** — per-part gain is reduced automatically as more devices join to prevent clipping.
- **Host gain override** — the host can manually set gain per part at any time.
- **Late joiner sync** — devices that join mid-performance receive the current playback state and catch up.
- **Clock sync** — `/api/clock-sync` is used to align device clocks for tight timing.
- **Audience size label** — displays Chamber / Small choir / Full choir / Mass choir based on device count.

## Songs

| Key | Title |
|-----|-------|
| `ode-to-joy` | Ode to Joy |
| `happy-birthday` | Happy Birthday |

## Tech stack

| Package | Role |
|---------|------|
| [Express](https://expressjs.com) | HTTP server & static file serving |
| [Socket.io](https://socket.io) | Real-time bidirectional events |
| [qrcode](https://github.com/soldair/node-qrcode) | QR code generation for the join URL |

## Getting started

```bash
npm install
npm start
```

The server binds to `0.0.0.0:3000` and logs the local IP on startup:

```
  Host page:    http://192.168.x.x:3000/host
  Client URL:   http://192.168.x.x:3000/
```

Open the host page on a screen visible to the room. Audience members scan the QR code to join.

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Audience client page |
| `GET /host` | Host control page |
| `GET /api/qr` | QR code SVG pointing to the client URL |
| `GET /api/clock-sync` | Returns server timestamp for clock alignment |
| `GET /api/state` | Current performance state snapshot (for host reconnect) |
