# Audience Choir

A live-event experiment that turns the audience's phones into a distributed choir. Each device joining the room is automatically assigned a voice part (Soprano, Alto, Tenor, or Bass) and plays its part in sync when the host triggers playback.

> **Musical experiment** — the synthesised tones aren't going to win any awards, but the concept works surprisingly well. Even with just 4 devices at home it sounded really cool. This was built to explore what's possible, and I'd love to see someone take it further into something truly special.

## How it works

1. The host opens `/host` on a laptop connected to a projector.
2. A QR code is displayed — audience members scan it to join.
3. Each device is auto-assigned a balanced voice part.
4. The host selects a song and hits **Play**. All devices count down and start in sync.

## Network requirement

**All devices — the host machine and every audience phone — must be connected to the same local WiFi network.** The server runs locally and communicates over that network, so devices on different networks (e.g. mobile data) will not be able to connect.

> Future direction: moving the server to the cloud would remove this limitation and open up remote or large-venue use cases without needing a dedicated local network.

## Setup & usage

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- All audience devices on the same WiFi network as the host machine

### Installation

```bash
git clone https://github.com/Bexolo/audience-experiment.git
cd audience-experiment
npm install
```

### Running the server

```bash
npm start
```

On startup the terminal will print:

```
  Host page:    http://192.168.x.x:3000/host
  Client URL:   http://192.168.x.x:3000/
```

### Hosting a performance

1. Open the **host page** (`/host`) on a laptop or tablet visible to the room — a projector works great.
2. The QR code on the host page links directly to the audience join URL. Display it so the room can scan it.
3. Audience members scan the QR code with their phone camera. The page loads automatically — no app required.
4. Watch devices appear on the host dashboard as people join. Each is auto-assigned a voice part.
5. Select a song from the host panel, then press **Play**. A countdown syncs all devices and playback begins simultaneously.
6. Use **Stop** to end the performance, or **Reset** to return to idle and start again.

### Tips

- **Silent mode will kill the sound** — make sure every device is set to loud/ring mode before scanning. Phones on silent or vibrate will not make any noise.
- Ask the audience to turn their volume up before scanning.
- The more devices, the better — parts thicken up and the choir effect becomes more pronounced.
- If a device joins late it will automatically catch up to the current performance state.
- You can manually reassign a device to a different part from the host panel if needed.

## Compatibility

| Platform | Status |
|----------|--------|
| iOS (iPhone/iPad) | Tested and working |
| Android | **Untested** — may work but behaviour is unverified |
| Desktop browser | Works for the host page |

Android users are welcome to try it and report back — contributions and compatibility fixes are very welcome.

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

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Audience client page |
| `GET /host` | Host control page |
| `GET /api/qr` | QR code SVG pointing to the client URL |
| `GET /api/clock-sync` | Returns server timestamp for clock alignment |
| `GET /api/state` | Current performance state snapshot (for host reconnect) |

## Contributing & ideas

This is an open experiment — if you have ideas for making it better, PRs and forks are very welcome. Some directions worth exploring:

- **Better audio synthesis** — richer waveforms, real instrument samples, or Web Audio API effects.
- **Cloud deployment** — host the server remotely so any audience can join without a shared local network.
- **More songs** — extend the song library with additional pieces or user-defined melodies.
- **Android compatibility** — verify and fix any platform-specific audio issues on Android browsers.
- **Visuals** — give the audience client a visual element that reacts to the music.
