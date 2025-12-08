import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SITE_URL = "https://wildgreen.blog";
const POSTS_DIR = path.resolve("src/content/posts");
const OUTPUT_PATH = path.resolve("public/sitemap-category.xml");

console.log("📦 Generating sitemap-category.xml...");
console.log("📁 Reading from:", POSTS_DIR);
console.log("📤 Writing to:", OUTPUT_PATH);

try {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".md"));

  if (files.length === 0) {
    console.warn("⚠️ No markdown files found in posts directory.");
  }

  const categorySet = new Set();

  files.forEach(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(content);

    // ✅ categories (array)
    if (Array.isArray(data.categories)) {
      data.categories.forEach(cat => categorySet.add(cat));
    }

    // ✅ category (array)
    if (Array.isArray(data.category)) {
      data.category.forEach(cat => categorySet.add(cat));
    }

    // ✅ category (string)
    if (typeof data.category === "string") {
      categorySet.add(data.category);
    }
  });

  const categories = [...categorySet].sort();
  const today = new Date().toISOString();

  const urls = categories.map(cat => {
    const slug = cat.toLowerCase().replace(/\s+/g, "-");

    return `
  <url>
    <loc>${SITE_URL}/category/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.6</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, xml.trim());
  console.log("✅ sitemap-category.xml generated successfully.");
} catch (err) {
  console.error("❌ Sitemap generation failed:", err.message);
}
