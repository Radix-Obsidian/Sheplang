import { readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { transpileShepToBoba } from "@goldensheepai/sheplang-to-boba";
import { generateApp } from "@goldensheepai/sheplang-compiler"; // TODO: Update when compiler is in alpha
import { writeTextFileSync, mkdirSync } from "../util/fs.js";

export async function cmdBuild(args: string[], flags: Record<string, any>) {
  const file = args[0];
  if (!file) throw new Error("build: missing <file>");
  const outDir = resolve(String(flags.out ?? "dist"));
  const src = readFileSync(file, "utf8");
  
  // Choose build target
  const target = String(flags.target ?? "boba").toLowerCase();
  
  if (target === "boba") {
    // Transpile to BobaScript
    const result = await transpileShepToBoba(src);
    
    if (!result.success) {
      // Show diagnostics
      console.error("Transpilation failed with errors:");
      result.diagnostics.forEach(diag => {
        const prefix = diag.severity === "error" ? "ERROR" : diag.severity.toUpperCase();
        console.error(`[${prefix}] ${diag.message} (${diag.start.line}:${diag.start.column})`);
      });
      process.exit(1);
    }
    
    // Save BobaScript output
    const outFile = resolve(outDir, basename(file).replace(/\.shep$/i, ".boba"));
    writeTextFileSync(outFile, result.output!);
    console.log(`Generated: ${outFile}`);
  } else if (target === "app") {
    // Generate full app
    const result = await generateApp(src, file);
    
    if (!result.success) {
      // Show diagnostics
      console.error("App generation failed with errors:");
      result.diagnostics.forEach(diag => {
        const prefix = diag.severity === "error" ? "ERROR" : diag.severity.toUpperCase();
        console.error(`[${prefix}] ${diag.message} (${diag.start.line}:${diag.start.column})`);
      });
      process.exit(1);
    }
    
    // Create output directory
    mkdirSync(outDir);
    
    // Write all generated files
    const generatedFiles: string[] = [];
    for (const [path, content] of Object.entries(result.output!.files)) {
      const outFile = resolve(outDir, path);
      writeTextFileSync(outFile, content);
      generatedFiles.push(outFile);
    }
    
    console.log(`Generated ${generatedFiles.length} files in ${outDir}`);
    console.log(`Entry point: ${resolve(outDir, result.output!.entryPoint)}`);
  } else {
    throw new Error(`Unknown target: ${target}. Supported targets: boba, app`);
  }
}
