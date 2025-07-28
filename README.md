# Cipher Nichu - AI-Generated Witty Answers

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-blue.svg)](https://nodejs.org/en/about/previous-releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project automatically generates unique, witty, and informative HTML pages based on common Google search queries, powered by AI. It's designed to be a fun and engaging way to explore everyday questions with a touch of humor and unexpected wisdom.

## ✨ Features

*   **AI-Powered Content Generation**: Leverages Google's Gemini API to create engaging and funny answers to user-generated topics.
*   **Automatic HTML Page Creation**: Generates standalone, semantic HTML5 pages with inline dark-themed CSS for a clean, minimalist look.
*   **SEO Optimized**: Each page includes relevant meta titles, descriptions, and keywords to improve searchability.
*   **Auto-Updating Sitemap**: Automatically generates and updates a `sitemap.xml` file to include all generated pages, ensuring discoverability.
*   **Telegram Notifications**: Sends notifications to a specified Telegram chat whenever a new page is created.
*   **Topic Management**: Keeps track of generated topics to avoid repetition.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or higher recommended)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd fun
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### API Keys Configuration

This project requires API keys for Google Gemini and Telegram. These keys are stored in `config.js` and obfuscated using `obfuscator.js`.

1.  **Google Gemini API Key**:
    *   Obtain an API key from the [Google AI Studio](https://aistudio.google.com/).
    *   Obfuscate your API key using the `obfuscator.js` script (or manually encode it if you prefer).
    *   Update the `GEMINI_API_KEY` in `config.js`.

2.  **Telegram Bot Token and Chat ID**:
    *   Create a Telegram bot using [@BotFather](https://t.me/botfather) on Telegram to get your bot token.
    *   Find your Telegram Chat ID. You can get this by sending a message to your bot and then checking the Telegram Bot API documentation or using a bot like [@userinfobot](https://t.me/userinfobot).
    *   Obfuscate your bot token and chat ID.
    *   Update `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `config.js`.

**Example `config.js` (after obfuscation):**
```javascript
const { encode } = require('./obfuscator');

module.exports = {
  GEMINI_API_KEY: "YOUR_OBFUSCATED_GEMINI_API_KEY",
  TELEGRAM_BOT_TOKEN: "YOUR_OBFUSCATED_TELEGRAM_BOT_TOKEN",
  TELEGRAM_CHAT_ID: "YOUR_OBFUSCATED_TELEGRAM_CHAT_ID",
};
```

## 💡 Usage

To generate a new witty answer page:

1.  Run the script from your terminal:
    ```bash
    node generate.js
    ```
    Alternatively, you can use the npm script:
    ```bash
    npm start
    ```

This will:
*   Fetch a new, unique question from the Gemini API.
*   Generate an HTML page answering the question.
*   Save the HTML file in the root directory (e.g., `how-to-make-coffee.html`).
*   Update the `index.html` with a link to the new page and increment the topic count.
*   Add the topic to `completedTopics.json`.
*   Send a notification to your Telegram bot.
*   Generate/update `sitemap.xml`.

## 📁 Project Structure

*   `.env`: Environment variables (if used, though keys are in `config.js`).
*   `config.js`: Stores obfuscated API keys and configuration.
*   `generate.js`: The main script for generating content and pages.
*   `obfuscator.js`: Utility for encoding/decoding strings (used for API keys).
*   `completedTopics.json`: Stores a list of topics already generated.
*   `index.html`: The main landing page listing all generated topics.
*   `*.html`: Dynamically generated pages for each topic.
*   `sitemap.xml`: An XML sitemap of all generated pages.
*   `package.json`: Project metadata and dependencies.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.