# Chat History Master

![Chat-History_Master](https://github.com/user-attachments/assets/dbf5f7cd-59a8-4193-8f29-f35db5e455ee)

## Overview

**Chat History Master** is a React application that provides a clean, organized interface for viewing and analyzing your chat history. Simply upload your conversation data in JSON format from various messaging platforms, and the application will display it in an intuitive, easy-to-navigate format.

## Features

- **Intuitive User Interface**: Clean, modern design that makes browsing chat histories effortless
- **Cross-Platform Support**: Compatible with chat exports from Facebook, TikTok, Instagram, and more
- **Conversation Analysis**: Easily search, filter, and analyze your chat conversations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Privacy-Focused**: All data processing happens locally on your device — no server uploads

## Demo

[View live demo](https://chat-history-master.vercel.app) (Optional link - if you have a demo available)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher) or **yarn** (v1.22.0 or higher)

You can check your current versions with:

```bash
node -v
npm -v
# OR
yarn -v
```

## Installation

### Option 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Lusan-sapkota/Chat-History_Master.git

# Navigate to the project directory
cd Chat-History_Master

# Install dependencies
npm install
# OR
yarn install
```

### Option 2: Download ZIP

1. Go to the [GitHub repository](https://github.com/Lusan-sapkota/Chat-History_Master)
2. Click on "Code" and select "Download ZIP"
3. Extract the ZIP file to your preferred location
4. Open a terminal in the extracted folder and run:
   ```bash
   npm install
   # OR
   yarn install
   ```

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev
# OR
yarn dev
```

The application will be available at `http://localhost:3000` in your web browser.

### Production Build

```bash
# Build for production
npm run build
# OR
yarn build

# Serve the production build
npm run start
# OR
yarn start
```

## How to Use

1. **Export Your Chat Data**:
   - **Facebook**: Go to Settings > Your Facebook Information > Download Your Information
   - **Instagram**: Go to Settings > Privacy and Security > Data Download
   - **TikTok**: Go to Settings > Privacy > Download Your Data
   - For other platforms, follow their specific export procedures

2. **Prepare Your Data**:
   - Make sure your exported chat data is in JSON format
   - Create a `/data` folder in the project root if it doesn't already exist
   - Place your JSON file in the `/data` directory with the filename `chatData.json`

3. **View Your Chat History**:
   - Launch the application
   - Your chat history will automatically load and display in the interface
   - Use the navigation menu to explore different conversations

4. **Advanced Features**:
   - Use the search function to find specific messages
   - Filter conversations by date or participant
   - Sort conversations by recent activity or alphabetically

## Troubleshooting

### Common Issues

- **"Cannot find module" error**: Make sure you've installed all dependencies with `npm install`
- **Blank screen after loading data**: Verify your JSON file is properly formatted
- **Application crashes on startup**: Check the console for specific error messages

### JSON Format Requirements

Your `chatData.json` file should follow this general structure:

```json
{
  "conversations": [
    {
      "participants": ["User 1", "User 2"],
      "messages": [
        {
          "sender": "User 1",
          "timestamp": "2023-01-01T12:00:00",
          "content": "Hello there!"
        },
        {
          "sender": "User 2",
          "timestamp": "2023-01-01T12:01:00",
          "content": "Hi! How are you?"
        }
      ]
    }
  ]
}
```

## Contributing

We welcome contributions to improve Chat History Master! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

Please ensure your code follows the project's coding standards and includes appropriate tests.

## Roadmap (Expect in Future)

- [ ] Add support for WhatsApp and Telegram exports
- [ ] Implement dark mode
- [ ] Add message statistics and visualization
- [ ] Enable message exporting in various formats
- [ ] Create user profiles and settings

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact & Support

- **Project Maintainer**: [Lusan Sapkota](https://github.com/Lusan-sapkota)
- **Report Issues**: [Issue Tracker](https://github.com/Lusan-sapkota/Chat-History_Master/issues)
- **Email**: sapkotalusan@gmail.com

---

Made with ❤️ by [Lusan Sapkota](https://github.com/Lusan-sapkota)
