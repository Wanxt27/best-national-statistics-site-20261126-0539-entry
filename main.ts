// Nusantara Statistics — hand-in program.
//
// Copies the site (app/) and its screenshots (screenshots/) from this
// repository into the hand-in directory, then writes the dossier that the
// kit library builds from those copied files. The hand-in directory is
// /output on the grader; outside it, MAKEFUN_OUTPUT_DIR stands in for it.
//
// Only the three known entries of the hand-in directory are ever cleared
// (app/, screenshots/, dossier.json); the directory itself is never removed.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const handInDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : "/output";

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function clearKnownEntries(dir: string): void {
  for (const name of ["app", "screenshots", "dossier.json"]) {
    const target = join(dir, name);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
    }
  }
}

function handIn(): void {
  mkdirSync(handInDir, { recursive: true });
  clearKnownEntries(handInDir);

  const siteDir = join(repoRoot, "app");
  const shotsDir = join(repoRoot, "screenshots");
  if (!existsSync(siteDir)) {
    throw new Error("hand-in: app/ is missing from " + repoRoot);
  }
  if (!existsSync(join(siteDir, "index.html"))) {
    throw new Error("hand-in: app/index.html is missing from " + repoRoot);
  }
  if (!existsSync(shotsDir)) {
    throw new Error("hand-in: screenshots/ is missing from " + repoRoot);
  }

  cpSync(siteDir, join(handInDir, "app"), { recursive: true });
  cpSync(shotsDir, join(handInDir, "screenshots"), { recursive: true });

  const dossier = buildDossier(handInDir, CAPS);
  writeFileSync(join(handInDir, "dossier.json"), dossier);
  console.log("handed in app/ + screenshots/ to " + handInDir);
  console.log("dossier.json: " + dossier.length + " bytes");
  console.log("output entries: " + readdirSync(handInDir).sort().join(", "));
}

handIn();
