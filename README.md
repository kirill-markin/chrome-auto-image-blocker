# Chrome Image Blocker

## Repository Overview
This repository contains a Chrome extension designed to block images on webpages with a simple click. The extension helps reduce distractions and improve page load times by controlling when images are displayed.

## Purpose
The main purpose of this extension is to:
- Block or show images with a single click on the extension icon
- Provide a quick visual indicator of the current state (images allowed or blocked)
- Improve browsing experience by reducing visual distractions
- Increase page load speed by preventing image loading

## Repository Structure
- `manifest.json`: Chrome extension configuration file
- `background.js`: Core service worker implementation of the extension
- `assets/`: Icons and resources for the extension
  - `icons/`: Icons for the extension UI
    - `connect.png`: Icon for the connected state (images allowed)
    - `disconnect.png`: Icon for the disconnected state (images blocked)
  - `screenshots/`: Example screenshots showing the extension in action
    - Contains examples from YouTube and Instagram
  - `promo-image/`: Marketing images for the Chrome Web Store
- `scripts/`: Utility scripts for development and deployment
  - `package.sh`: Script to package the extension into a ZIP file for Chrome Web Store submission
- `icon.png`: Extension icon displayed in Chrome toolbar
- `LICENSE`: MIT license file
- `README.md`: Documentation and installation instructions

## Key Features
- One-click toggle to enable/disable images instantly
- Visual indicator of current state through icon changes
- Simple, lightweight interface
- No setup required

## Installation
1. Clone the repository
2. Load as unpacked extension in Chrome's developer mode
3. Or install from the Chrome Web Store (if published)

## Packaging for Chrome Web Store
To package the extension for submission to the Chrome Web Store:
1. Run the packaging script: `./scripts/package.sh`
2. The script will create a `dist/extension.zip` file containing all necessary files
3. Upload this ZIP file to the Chrome Web Store Developer Dashboard

## How to Use
1. Click the extension icon in your Chrome toolbar to toggle images on or off
2. The icon will change to indicate the current state:
   - Connected icon: Images are allowed
   - Disconnected icon: Images are blocked

## Development Guidelines
- Maintain the simple, clean UI design
- Keep performance impact minimal
- Follow Chrome extension best practices
- Test thoroughly on various websites

## Screenshots

| ![YouTube example](/assets/screenshots/screenshots-1.png) | ![Instagram example](/assets/screenshots/screenshots-2.png) |
|:---------------------------------------------:|:---------------------------------------------:|
| YouTube example                                  | Instagram example                                  |

## Features

- Toggles images on or off with a single click
- Visual feedback through icon changes
- Simple, intuitive interface
- No configuration needed
- Lightweight and efficient

## How It Works

This extension changes Chrome's image settings to block or allow images with a single click. The extension icon updates to visually indicate whether images are currently allowed or blocked.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, feel free to contact me at [markinkirill@gmail.com](mailto:markinkirill@gmail.com).

## Authors

This extension was created by 
- [Kirill Markin](https://kirill-markin.com/)
- [Maria Podobrazhnykh](https://www.linkedin.com/in/maria-podobrazhnykh/)
- [Andrey Markin](https://andrey-markin.com/)
