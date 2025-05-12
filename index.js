#!/usr/bin/env node

/**
 * CLI tool: generate biometric images from DG2/DG3 descriptors using tsemrtd.js
 * Usage: node index.js <input-file> [--output <output-directory>] [--type <dg2|dg3>]
 */

import fs from 'fs';
import path from 'path';
import { DG2, DG3 } from '@li0ard/tsemrtd/dist/index.js';
import { program } from 'commander';

program
  .argument('<input>', 'DG descriptor file')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-t, --type <type>', 'Document type to extract: dg2 (face) or dg3 (fingerprint)', 'dg3')
  .parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];
const outputDir = options.output;
const type = options.type.toLowerCase();

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load binary file
try {
  const file_buffer = fs.readFileSync(inputPath);
  
  if (type === 'dg3') {
    const fingerprint = DG3.load(file_buffer);
    console.log('Fingerprint structure:', Object.keys(fingerprint));

    for (const [index, finger] of fingerprint.entries()) {
      const imageData = fingerprint[index].imageData;
      await Bun.write(`${outputDir}/fingerprint_${index}.wsq`, imageData);
    }
    console.log(`Extracted ${fingerprint.length} fingerprints to ${outputDir}`);
  } 
  else if (type === 'dg2') {
    const faceData = DG2.load(file_buffer);
    console.log('Face data structure:', Object.keys(faceData));
    
    for (const [index, face] of faceData.entries()) {
      const imageData = faceData[index].imageData;
      await Bun.write(`${outputDir}/face_${index}.jp2`, imageData);
    }
    console.log(`Extracted ${faceData.length} facial images to ${outputDir}`);
  }
  else {
    console.error('Invalid type. Use either "dg2" or "dg3"');
    process.exit(1);
  }
  
} catch (err) {
  console.error(`Failed to read or parse ${type.toUpperCase()} file:`, err.message);
  process.exit(1);
}