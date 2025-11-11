#!/usr/bin/env node
import './register';
import { main } from './main';
main().catch((e: Error) => { console.error(e); process.exit(1); });
