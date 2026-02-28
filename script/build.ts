import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log("Building Hospital Triage System...");

  try {
    // Build client
    console.log("Building client...");
    execSync("vite build", { cwd: __dirname, stdio: "inherit" });

    // Build server
    console.log("Building server...");
    execSync("tsc", { cwd: __dirname, stdio: "inherit" });

    console.log("✓ Build completed successfully!");
  } catch (error) {
    console.error("✗ Build failed:", error);
    process.exit(1);
  }
}

build();
