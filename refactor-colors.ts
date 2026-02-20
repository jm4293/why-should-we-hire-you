import fs from "fs";
import path from "path";

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith(".tsx") || dirPath.endsWith(".ts")) {
      callback(dirPath);
    }
  });
}

const colorMappings: Record<string, string> = {
  // Backgrounds
  "bg-gray-900": "bg-primary",
  "bg-gray-800": "bg-primary/90",
  "bg-gray-100": "bg-muted",
  "bg-gray-50": "bg-muted/50",
  "bg-white": "bg-background",

  // Text
  "text-gray-900": "text-primary",
  "text-gray-800": "text-primary/90",
  "text-gray-600": "text-muted-foreground",
  "text-gray-500": "text-muted-foreground",
  "text-gray-400": "text-muted-foreground/70",
  "text-gray-300": "text-muted-foreground/50",
  "text-gray-200": "text-muted-foreground/30",
  "text-white": "text-primary-foreground",

  // Borders
  "border-gray-200": "border-border",
  "border-gray-100": "border-border/50",
  "border-gray-300": "border-border",
  "border-gray-800": "border-primary/20",

  // Rings
  "ring-gray-900": "ring-ring",
  "ring-gray-200": "ring-ring/20",
};

let matchCount = 0;

walkDir("./src", (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;

  for (const [oldClass, newClass] of Object.entries(colorMappings)) {
    // Replace whole word matches only to avoid partial matches
    const regex = new RegExp(`\\b${oldClass}\\b`, "g");
    content = content.replace(regex, newClass);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    matchCount++;
    console.log(`Updated ${filePath}`);
  }
});

console.log(`Refactored colors in ${matchCount} files.`);
