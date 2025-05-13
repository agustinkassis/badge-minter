# Nostr POV Badge Minter

A web application for creating and distributing proof-of-visit (POV) badges on Nostr. Event organizers can easily generate QR codes that attendees can scan to claim unique badges as proof of their attendance.

## Technical Documentation

See the [Flow Documentation](docs/FLOW.md) for detailed technical implementation.

## Features

- **Badge Creation & Management**: Create and manage digital badges for your events
- **QR Code Generation**: Dynamic QR codes with automatic refresh to prevent farming
- **Real-time Claiming**: See who claims badges in real-time
- **Nostr Integration**: Badges are minted directly on the Nostr network
- **Mobile-Friendly**: Responsive design works great on all devices
- **Share Functionality**: Recipients can easily share their badges on social media

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pov-badge-minter.git
cd pov-badge-minter
```

2. Install dependencies:

```bash
nvm use
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

### Created By

[Agustin Kassis](https://github.com/agustinkassis) from [La Crypta](https://lacrypta.ar)
