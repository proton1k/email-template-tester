import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import minimist from "minimist";

function getFormattedDatetime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function selectHtmlFile(htmlFolderPath) {
  try {
    const files = await fs.readdir(htmlFolderPath);
    const htmlFiles = files.filter(
      file => path.extname(file).toLowerCase() === ".html"
    );

    if (htmlFiles.length === 0) {
      console.error("No HTML files found in the 'html' folder.");
      process.exit(1);
    }

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "selectedFile",
        message: "Select an HTML file to send:",
        choices: htmlFiles
      }
    ]);

    return path.join(htmlFolderPath, answers.selectedFile);
  } catch (error) {
    console.error("Error reading HTML folder:", error);
    process.exit(1);
  }
}

async function sendHtmlEmail(htmlFilePath, fromEmail, toEmail) {
  const mailtrapApiToken = process.env.MAILTRAP_API_TOKEN;
  const inboxId = process.env.MAILTRAP_INBOX_ID;

  if (!mailtrapApiToken || !inboxId) {
    console.error(
      "Error: MAILTRAP_API_TOKEN and MAILTRAP_INBOX_ID must be set in the .env file."
    );
    process.exit(1);
  }

  if (!htmlFilePath) {
    console.error("Error: HTML file path is required.");
    process.exit(1);
  }

  let htmlContent;
  try {
    htmlContent = await fs.readFile(htmlFilePath, "utf-8");
  } catch (error) {
    console.error("Error reading HTML file:", error);
    return;
  }

  // --- Subject ---
  const filename = path.basename(htmlFilePath);
  const formattedDateTime = getFormattedDatetime();
  const subject = `Email Test: ${filename} - ${formattedDateTime}`;

  // --- API Request ---
  const apiUrl = `https://sandbox.api.mailtrap.io/api/send/${inboxId}`;
  const requestData = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mailtrapApiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: {
        email: fromEmail,
        name: "Mailtrap Test"
      },
      to: [{ email: toEmail }],
      subject: subject,
      html: htmlContent,
      category: "Integration Test"
    })
  };

  try {
    const response = await fetch(apiUrl, requestData);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailtrap API Error: ${response.status} - ${errorText}`);
    }
    const responseData = await response.json();
    console.log("Email sent successfully!", responseData);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function parseCommandLineArgs() {
  const args = minimist(process.argv.slice(2), {
    string: ["from", "to"],
    alias: { f: "from", t: "to" },
    default: { from: process.env.EMAIL_FROM, to: process.env.EMAIL_TO }
  });

  return args;
}

async function main() {
  const args = parseCommandLineArgs();
  const htmlFilePath = args._[0];
  const htmlFolderPath = "html";

  let fromEmail = args.from;
  let toEmail = args.to;

  if (!fromEmail) {
    console.error(
      "Error: Sender email ('from') must be provided either via --from, -f, or the EMAIL_FROM environment variable."
    );
    process.exit(1);
  }
  if (!toEmail) {
    console.error(
      "Error: Recipient email ('to') must be provided either via --to, -t, or the EMAIL_TO environment variable."
    );
    process.exit(1);
  }

  if (htmlFilePath) {
    await sendHtmlEmail(htmlFilePath, fromEmail, toEmail);
  } else {
    const selectedFilePath = await selectHtmlFile(htmlFolderPath);
    await sendHtmlEmail(selectedFilePath, fromEmail, toEmail);
  }
}

main();
