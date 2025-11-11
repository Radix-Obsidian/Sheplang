export function parseArgs(argv: string[]) {
  const [cmd = "help", ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i];
    if (t.startsWith("--")) {
      const [k, v] = t.slice(2).split("=");
      if (typeof v === "string") flags[k] = v;
      else if (i + 1 < rest.length && !rest[i + 1].startsWith("-")) flags[k] = rest[++i];
      else flags[k] = true;
    } else {
      positionals.push(t);
    }
  }
  return { cmd, rest: positionals, flags };
}
