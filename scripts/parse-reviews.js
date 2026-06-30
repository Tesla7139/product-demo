const fs = require("fs");
const path = require("path");

const csvPath = "c:\\Users\\sarth\\Downloads\\reviews.csv";
const outputPath = path.join(__dirname, "..", "src", "lib", "reviews.ts");

function parseCSV(content) {
  const lines = [];
  let currentLine = "";
  let insideQuote = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      insideQuote = !insideQuote;
      currentLine += char;
    } else if (char === "\n" && !insideQuote) {
      lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function parseCSVRow(row) {
  const result = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === "," && !insideQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

try {
  const csvContent = fs.readFileSync(csvPath, "utf8");
  const lines = parseCSV(csvContent);
  
  // Headers: Platform ID,Date,Rating,Edited,Time spent using app,Customer Name,Customer Domain,Content,Archived At
  const headers = parseCSVRow(lines[0]);
  
  const reviews = [];
  const colors = ["orange", "blue", "green", "white"];
  let colorIndex = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = parseCSVRow(line);
    if (columns.length < 8) continue;

    const id = columns[0];
    const dateStr = columns[1];
    const rating = columns[2];
    const name = columns[5];
    const contentText = columns[7];

    // Filter out rows without text review content
    if (!contentText || contentText.length < 5) continue;

    // Format date: e.g. 2026-06-09T00:00:00.000Z -> "JUNE 9, 2026"
    let formattedDate = "";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        formattedDate = d.toLocaleDateString("en-US", options).toUpperCase();
      } else {
        formattedDate = "RECENT";
      }
    } catch {
      formattedDate = "RECENT";
    }

    // Determine color
    const color = colors[colorIndex % colors.length];
    colorIndex++;

    // Determine font style based on review text length (longer text looks great in Serif Lora)
    const font = contentText.length > 150 ? "serif" : "sans";

    // Clean up name
    let displayName = name;
    if (name.toLowerCase().endsWith(".myshopify.com")) {
      displayName = name.substring(0, name.length - 14);
    }
    
    // Assign generic logo initials or design details
    let logoType = null;
    if (displayName.length > 0) {
      if (color === "orange" && Math.random() > 0.5) {
        logoType = "circle";
      } else if (color === "green" && Math.random() > 0.5) {
        logoType = "square";
      } else if (color === "white" && Math.random() > 0.6) {
        logoType = "badge";
      }
    }

    // Clean up backslashes/quotes in content
    const cleanContent = contentText
      .replace(/\\"/g, '"')
      .replace(/""/g, '"')
      .replace(/^\s*"/, '')
      .replace(/"\s*$/, '')
      .replace(/\r/g, '')
      .trim();

    reviews.push({
      id,
      name: displayName,
      date: formattedDate,
      rating: parseInt(rating) || 5,
      content: cleanContent,
      color,
      font,
      logoType,
    });
  }

  // Create TypeScript file content
  const outputCode = `export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  content: string;
  color: "orange" | "blue" | "green" | "white";
  font: "serif" | "sans";
  logoType: "circle" | "square" | "badge" | null;
}

export const reviews: Review[] = ${JSON.stringify(reviews, null, 2)};
`;

  fs.writeFileSync(outputPath, outputCode, "utf8");
  console.log(`Successfully parsed ${reviews.length} reviews and saved to ${outputPath}`);
} catch (err) {
  console.error("Error processing CSV:", err);
  process.exit(1);
}
