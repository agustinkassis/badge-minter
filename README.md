# Nostr POV Badge Minter

A web application for creating and distributing proof-of-visit (POV) badges on Nostr. Event organizers can easily generate QR codes that attendees can scan to claim unique badges as proof of their attendance.

## Technical Documentation

See the [Flow Documentation](docs/FLOW.md) for detailed technical implementation.

## Features

- **Mint Badges**: Distribute badges in your event
- **QR Code Generation**: Dynamic QR codes with automatic refresh to prevent farming
- **Real-time Claiming**: See who claims badges in real-time
- **Nostr Integration**: Badges are minted directly on the Nostr network
- **Mobile-Friendly**: Responsive design works great on all devices

## Tech stack

- **React 19.x**: For building the user interface
- **TypeScript 5.x**: For type-safe development
- **TailwindCSS 3.x**: For styling
- **Framer Motion**: For animations
- **Next JS 15.x**: For server-side rendering
- **shadcn/ui**: For accessible UI components
- **Nostrify**: For Nostr protocol integration
- **Nostr Tools**: For Nostr library functions

## Roadmap

- [x] Admin/User frontend
- [x] Display QR generator
- [x] Claim request / response
- [x] Award badge
- [ ] Nonce burning/expiration
- [ ] Prevent multiple claims from the same user
- [ ] Nsec bunker support
- [ ] Reusable QR in a short period of time
- [ ] Badge admin dashboard
  - [ ] Badge generator
  - [ ] Newsletter
  - [ ] Badge collection
  - [ ] Badge distribution

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
