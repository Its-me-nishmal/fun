const config = require('./config');
const { decode } = require('./obfuscator');
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const COMPLETED_TOPICS_PATH = "./completedTopics.json";
const OUTPUT_DIR = "."; // root directory
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = decode(config.GEMINI_API_KEY);

// Load completed topics
const completedTopics = JSON.parse(fs.readFileSync(COMPLETED_TOPICS_PATH, "utf-8"));

// Prompt Gemini to get a new creative, funny, smart topic
async function getNewTopic() {
  const systemPrompt = `
You're an AI for "cipher nichu" hosted at fun.nichu.dev.
Your goal is to generate a single, simple, funny, or common question that people might Google.
The question should be easy for anyone to understand.

Avoid these topics:\n${completedTopics.map(t => `"${t}"`).join(", ")}

Return ONLY the question. No extra text or explanation.
`;

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
    })
  });


  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  return text?.trim();
}

// Generate HTML content for that topic using Gemini
async function generateHTML(topic) {
  const prompt = `
You are a world-class AI web copywriter and SEO expert.
Your job is to create a standalone HTML file for the brand "Cipher Nichu" that acts as a funny, witty "answer" to a Google search query.

The search query (topic) is: "${topic}"

Generate one full, clean, semantic HTML5 page based on this.

Here are the rules:
1.  **Doctype and Lang**: Start with \`<!DOCTYPE html>\` and \`<html lang="en">\`.
2.  **Title**: Write a clever, thought-provoking <title> that feels like a direct, funny answer to the query.
3.  **Meta Description**: Write a <meta name="description"> that supports the title with humor or unexpected wisdom, including relevant keywords naturally.
4.  **Meta Keywords**: Add <meta name="keywords"> with terms related to the query to boost searchability.
5.  **Meta Author**: Add \`<meta name="author" content="Cipher Nichu">\`.
6.  **CSS**: Use simple, inline CSS within a \`<style>\` tag in the \`<head>\`. The style should be minimalist and not distract from the message. Use a dark theme (e.g., background: #121212; color: #e0e0e0;). Center the content vertically and horizontally.
7.  **Body Content**: In the \`<body>\`, use an \`<h1>\` for the main punchline, followed by a \`<p>\` that continues the joke or message.
8.  **Footer**: End the body with \`<footer>— Cipher Nichu</footer>\`.
9.  **No Extras**: No scripts, no external links, no complex UI. It must be a single, lightweight, self-contained HTML file.

Return ONLY the full HTML code, starting with \`<!DOCTYPE html>\` and ending with \`</html>\`. Do not include any markdown code block delimiters like \`\`\`html or \`\`\`. Do not include any other text or explanation.
`;

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  let html = res?.ok ? data?.candidates?.[0]?.content?.parts?.[0]?.text || null : null;

  // Add Schema.org markup
  const schemaMarkup = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Fun Tools by Nichu",
  "url": "https://fun.nichu.dev",
  "author": {
    "@type": "Person",
    "name": "Cipher Nichu"
  }
}
</script>
`;

  // Inject schema markup into the HTML head
  if (html) {
    const headEndIndex = html.indexOf('</head>');
    if (headEndIndex !== -1) {
      html = html.substring(0, headEndIndex) + schemaMarkup + html.substring(headEndIndex);
    } else {
      // Fallback if </head> tag is not found (should not happen with valid HTML)
      html += schemaMarkup;
    }
  }

  return html;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Send notification to Telegram
async function sendTelegramNotification(title, filename) {
  const telegramApiUrl = `https://api.telegram.org/bot${decode(config.TELEGRAM_BOT_TOKEN)}/sendMessage`;
  const chatId = decode(config.TELEGRAM_CHAT_ID);
  const message = `New page generated!\n\n*${title}*\n\n[https://fun.nichu.dev/${filename}](https://fun.nichu.dev/${filename})`;

  try {
    const res = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });

    if (res.ok) {
      console.log("✅ Telegram notification sent.");
    } else {
      const errorData = await res.json();
      console.error("❌ Failed to send Telegram notification:", errorData.description);
    }
  } catch (err) {
    console.error("❌ Error sending Telegram notification:", err.message);
  }
}

// Update index.html
function updateIndex(newTopic, newFilename) {
  const indexPath = path.join(OUTPUT_DIR, "index.html");
  let indexContent = fs.readFileSync(indexPath, "utf-8");

  // Add the new link
  const newLink = `<li><a href="/${newFilename}">${newTopic}</a></li>`;
  const listEndMarker = "</ul>";
  indexContent = indexContent.replace(listEndMarker, `  ${newLink}\n    ${listEndMarker}`);

  // Update the count
  const countRegex = /<span id="topic-count">\d+<\/span>/;
  const currentCount = parseInt(indexContent.match(/<span id="topic-count">(\d+)<\/span>/)[1], 10);
  const newCount = currentCount + 1;
  indexContent = indexContent.replace(countRegex, `<span id="topic-count">${newCount}</span>`);

  fs.writeFileSync(indexPath, indexContent, "utf-8");
  console.log("✅ Updated index.html");
}

// Main
(async () => {
  try {
    const topic = await getNewTopic();
    if (!topic) throw new Error("No topic generated.");

    console.log("New topic:", topic);
    const htmlContent = await generateHTML(topic);
    if (!htmlContent || !htmlContent.includes("<html")) throw new Error("Invalid HTML.");

    const filename = `${slugify(topic)}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, htmlContent, "utf-8");

    // Save to completedTopics.json
    completedTopics.push(topic);
    fs.writeFileSync(COMPLETED_TOPICS_PATH, JSON.stringify(completedTopics, null, 2));

    console.log(`✅ Generated: ${filename}`);

    // Update index.html
    updateIndex(topic, filename);

    // Send Telegram notification
    await sendTelegramNotification(topic, filename);
  
    // Generate sitemap
    await generateSitemap();
  } catch (err) {
    console.error("❌ Failed:", err.message);
  }
  })();
  
  // Generate sitemap.xml
  async function generateSitemap() {
    const baseUrl = "https://fun.nichu.dev/";
    const sitemapPath = path.join(OUTPUT_DIR, "sitemap.xml");
  
    try {
      const files = await fs.promises.readdir(OUTPUT_DIR);
      const htmlFiles = files.filter(file => file.endsWith(".html") && file !== "index.html"); // Exclude index.html from sitemap
  
      let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;
  
      // Add index.html to sitemap
      sitemapContent += `  <url>
      <loc>${baseUrl}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  `;
  
      // Add other HTML files to sitemap
      for (const file of htmlFiles) {
        const loc = `${baseUrl}${file}`;
        const lastmod = new Date().toISOString().split('T')[0]; // Assuming all generated pages are updated daily
        const changefreq = "daily";
        const priority = "0.8"; // Lower priority for individual pages
  
        sitemapContent += `  <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `;
      }
  
      sitemapContent += `</urlset>`;
  
      await fs.promises.writeFile(sitemapPath, sitemapContent, "utf-8");
      console.log("✅ Generated sitemap.xml");
    } catch (err) {
      console.error("❌ Failed to generate sitemap.xml:", err.message);
    }
  }
