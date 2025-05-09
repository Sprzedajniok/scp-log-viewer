# SCP:SL Log Viewer

Web application for analyzing SCP: Secret Laboratory game logs.

## Features

-  View detailed round statistics
-  Track top killers and winners
-  Kill feed
-  Dark/Light mode support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sprzedajniok/scp-log-viewer.git
cd scp-log-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Launch the application
2. Drag and drop your SCP:SL log file (`.txt` or `.log`) into the upload area
3. View the parsed statistics and kill feed
4. Toggle between dark and light mode using the theme button

## Log File Format

The application expects SCP:SL log files in the standard format, containing:
- Round start/end timestamps
- Kill events with player roles
- Round end statistics

## Development

Built with:
- React + TS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.
