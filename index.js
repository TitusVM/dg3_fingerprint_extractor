#!/usr/bin/env node

/**
 * CLI tool: generate biometric images from DG2/DG3 descriptors using tsemrtd.js
 * Usage: node index.js <input-file> [--output <output-directory>] [--type <dg2|dg3>]
 */

import fs from 'fs';
import path from 'path';
import { DG2, DG3 } from '@li0ard/tsemrtd/dist/index.js';
import { FingerType, FingerImageType } from '@li0ard/tsemrtd/dist/consts/enums.js';
import { program } from 'commander';

// Based on https://nvlpubs.nist.gov/nistpubs/legacy/ir/nistir6529-a.pdf Table 4
function getBiometricType(code) {
  if (code === 8) {
    return "Fingerprint";
  } else {
    return "Unknown biometric type: " + code;
  }
}

// Based on https://nvlpubs.nist.gov/nistpubs/legacy/ir/nistir6529-a.pdf Table 6
function getBiometricSubtype(code) {
  // Check if code is 0 (no information)
  if (code === 0) {
    return "No information given";
  }

  // Extract the relevant bits for position (right/left)
  const position = code & 0b11; // Extract b2 and b1
  
  // Extract finger type (bits b5, b4, b3)
  const fingerType = (code >> 2) & 0b111; // Shift right by 2 and mask with 111
  
  let result = "";
  
  // Determine position (right/left)
  if (position === 0b01) {
    result = "Right ";
  } else if (position === 0b10) {
    result = "Left ";
  }
  
  // Determine finger type
  switch (fingerType) {
    case 0b000:
      return result ? result.trim() : "No meaning";
    case 0b001:
      result += "Thumb";
      break;
    case 0b010:
      result += "Pointer finger";
      break;
    case 0b011:
      result += "Middle finger";
      break;
    case 0b100:
      result += "Ring finger";
      break;
    case 0b101:
      result += "Little finger";
      break;
    default:
      return "Reserved for future use";
  }
  
  return result;
}

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
    // console.log('Fingerprint structure:', Object.keys(fingerprint));
    for (const [index, finger] of fingerprint.entries()) {
      const fpType = FingerType[finger.fingerType];
      console.log(`--- Fingerprint \x1b[32m${fpType}\x1b[0m ---`);

      // Fingerprint characteristics
      const fpImageType = finger.fingerImageType;
      const quality = finger.quality;
      const ICAOType = getBiometricType(finger.sbh.type);
      const ICAOSubType = getBiometricSubtype(finger.sbh.sutype);
      console.log(`ICAO Header:`);
      console.log(`• ICAO Type: \x1b[32m${ICAOType}\x1b[0m`);
      console.log(`• ICAO Subtype: \x1b[32m${ICAOSubType}\x1b[0m`);

      console.log(`Biometric Data Block Header:`);
      console.log(`• BDB Fingerprint type: \x1b[32m${fpType}\x1b[0m`);
      // console.log(`ICAO Finger Type: \x1b[32m${subType}\x1b[0m`);
      console.log(`• Resolution: \x1b[32m${finger.imageResolutionVertical}x${finger.imageResolutionHorizontal}\x1b[0m`);
      console.log(`• Quality: \x1b[32m${quality}%\x1b[0m`);
      console.log(`• Image Type: \x1b[32m${FingerImageType[fpImageType]}\x1b[0m`);
      console.log();
    }

    for (const [index, finger] of fingerprint.entries()) {
      const imageData = fingerprint[index].imageData;
      const fpType = FingerType[finger.fingerType].toLowerCase().replace(/\s+/g, '_');
      await Bun.write(`${outputDir}/${path.basename(inputPath, path.extname(inputPath))}_${fpType}.wsq`, imageData);
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