#!/usr/bin/env node

/**
 * CLI tool: generate fingerprint images from a DG3 descriptor using tsemrtd.js
 * Usage: node index.js <input-file.dg3> [--output <output-directory>]
 */

import fs from 'fs';
import path from 'path';
import { DG3 } from '@li0ard/tsemrtd/dist/index.js';
import { createCanvas, ImageData } from 'canvas';
import { program } from 'commander';

program
  .argument('<input>', 'DG3 descriptor file')
  .option('-o, --output <dir>', 'Output directory', './fingerprints')
  .parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];
const outputDir = options.output;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load DG3 binary file
let fingerprint;
try {
  const file_buffer = fs.readFileSync(inputPath);
  fingerprint = DG3.load(file_buffer);
  console.log('Fingerprint structure:', Object.keys(fingerprint));

  for (const [index, finger] of fingerprint.entries()) {
    const imageData = fingerprint[index].imageData;
    await Bun.write(`${outputDir}/fingerprint_${index}.wsq`, imageData);
  }
  
} catch (err) {
  console.error('Failed to read or parse DG3 file:', err.message);
  process.exit(1);
}
