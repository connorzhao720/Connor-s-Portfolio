import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const clientDir = "dist/client";
const prerenderedDir = "dist/server/prerendered-routes";
const pagesDir = "dist/pages";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function copyRoutes(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const source = join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      await copyRoutes(source);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    const route = relative(prerenderedDir, source);
    const destination = route === "index.html" || route === "404.html"
      ? join(pagesDir, route)
      : join(pagesDir, route.slice(0, -5), "index.html");
    const html = (await readFile(source, "utf8")).replaceAll('"/assets/', `"${basePath}/assets/`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
}

await rm(pagesDir, { force: true, recursive: true });
await mkdir(pagesDir, { recursive: true });
await cp(clientDir, pagesDir, { recursive: true });
await copyRoutes(prerenderedDir);
