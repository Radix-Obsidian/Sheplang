#!/usr/bin/env node
import { parseArgs } from "./util/parseArgs.js";
import { cmdParse } from "./commands/parse.js";
import { cmdBuild } from "./commands/build.js";
import { cmdDev } from "./commands/dev.js";
import { cmdExplain } from "./commands/explain.js";
import { cmdStats } from "./commands/stats.js";
import { cmdInit } from "./commands/init.js";

async function main() {
  const { cmd, rest, flags } = parseArgs(process.argv.slice(2));
  switch (cmd) {
    case "init":
      await cmdInit(rest); break;
    case "parse":
      await cmdParse(rest); break;
    case "build":
      await cmdBuild(rest, flags); break;
    case "dev":
      await cmdDev(rest, flags); break;
    case "explain":
      await cmdExplain(rest); break;
    case "stats":
      await cmdStats(); break;
    case "--version":
    case "version":
      console.log("0.1.3"); break;
    case "help":
    default:
      printHelp();
  }
}

function printHelp() {
  console.log(`sheplang <command> [file] [--out dir] [--port 8787]

Commands:
  init todo         Scaffold a battle-tested todo.shep template
  parse <file>      Print Shep AST (JSON)
  build <file>      Emit BobaScript to dist/
  dev <file>        Build + serve preview on :8787 with HMR
  explain <file>    Human-readable explanation
  stats             Repo-wide quick stats

Examples:
  sheplang init todo
  sheplang build examples/todo.shep
  sheplang dev examples/todo.shep --port 8787
`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
