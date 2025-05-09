# DG3 Fingerprint Extractor

A command-line tool for extracting fingerprint images from DG3 descriptor files using the tsemrtd library.

## Description

This tool parses DG3 descriptor files (typically found in electronic documents like ePassports) and extracts the fingerprint data, saving it as WSQ (Wavelet Scalar Quantization) files.

## Installation

```bash
# Clone this repository
git clone <repository-url>

# Install dependencies
npm install
```

## Usage

```bash
node index.js <input-file.bin> [--output <output-directory>]
```

### Arguments

- `<input-file.bin>`: Path to the DG3 descriptor file (required)

### Options

- `-o, --output <dir>`: Output directory for extracted fingerprints (default: './fingerprints')

## Examples

```bash
# Extract fingerprints from DG3.bin to the default directory
node index.js DG3.bin

# Extract fingerprints to a custom directory
node index.js DG3.bin --output ./my_fingerprints
```

## Dependencies

- [@li0ard/tsemrtd](https://www.npmjs.com/package/@li0ard/tsemrtd): For parsing DG3 files
- [canvas](https://www.npmjs.com/package/canvas): For image processing
- [commander](https://www.npmjs.com/package/commander): For command-line interface

## Note

This tool is designed to work with Bun runtime for file writing operations.