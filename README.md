# Mailtrap HTML Email Sender

This Node.js script sends HTML emails using the Mailtrap API. It provides flexibility in choosing the HTML file to send, either by specifying a file path directly or by selecting from a list of HTML files in a designated folder.  It also supports setting the sender and recipient email addresses via command-line arguments or environment variables.

## Features

* **Interactive File Selection:** If no file path is provided as a command-line argument, the script presents an interactive list of HTML files in the `html` folder for the user to choose from.
* **Command-Line Arguments:**
  * `filepath`: (Optional) The path to the HTML file to send. If not provided, interactive selection is used.
  * `--from` or `-f`: The sender's email address.  Falls back to the `EMAIL_FROM` environment variable if not provided.
  * `--to` or `-t`: The recipient's email address. Falls back to the `EMAIL_TO` environment variable if not provided.
* **Environment Variables:**
  * `MAILTRAP_API_TOKEN`: Your Mailtrap API token (required).
  * `MAILTRAP_INBOX_ID`: Your Mailtrap inbox ID (required).
  * `EMAIL_FROM`: (Optional) Default sender email address.
  * `EMAIL_TO`: (Optional) Default recipient email address.
* **Dynamic Subject:** The email subject is dynamically generated, including the filename and the current date/time.

## Prerequisites

* Node.js (v18 or later recommended, for built-in `fetch`).  If using an older version, you'll need to install `node-fetch`: `npm install node-fetch`
* A Mailtrap account and API token.  You can sign up for a free account at [https://mailtrap.io/](https://mailtrap.io/).

## Installation

1. **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## Configuration

**Add your Mailtrap credentials to `.env`:**

```plain
MAILTRAP_API_TOKEN=your_mailtrap_api_token
MAILTRAP_INBOX_ID=your_mailtrap_inbox_id
EMAIL_FROM=[email]  # Optional
EMAIL_TO=[email] # Optional
```

## Usage

```bash
node sendEmail.js
node sendEmail.js path/to/your/email.html --from sender@example.com --to recipient@example.com
node sendEmail.js path/to/your/email.html -f sender@example.com -t recipient@example.com
node sendEmail.js -f sender@example.com  # Interactive selection, custom sender
node sendEmail.js path/to/file.html -t recipient@example.com  # Specific file, custom recipient
```
