# The Web App is deployed
[Biometric Data Extractor](https://titusvm.github.io/emrtd_biometric_data_extractor)

# DG2/DG3 Biometric Data Extractor CLI Tooling

A command-line tool for extracting biometric data from electronic travel documents, including:
- Fingerprint images from DG3 descriptor files (WSQ format)
- Facial images from DG2 descriptor files (JP2 format)

## Description

This tool parses DG2 and DG3 descriptor files (typically found in electronic documents like ePassports) and extracts the biometric data. DG3 fingerprint data is saved as WSQ (Wavelet Scalar Quantization) files, while DG2 facial data is saved as JP2 (JPEG 2000) files.

## Installation

```bash
# Clone this repository
git clone <repository-url>

# Install dependencies
npm install
```

## Usage

```bash
bun run index.js <input-file> [--output <output-directory>] [--type <dg2|dg3>]
```

### Arguments

- `<input-file>`: Path to the DG2 or DG3 descriptor file (required)

### Options

- `-o, --output <dir>`: Output directory for extracted data (default: './output')
- `-t, --type <type>`: Document type to extract: dg2 (face) or dg3 (fingerprint) (default: 'dg3')

## Examples

```bash
# Extract fingerprints from DG3.bin to the default directory
bun run index.js DG3.bin --type dg3

# Extract facial images from DG2.bin to a custom directory
bun run index.js DG2.bin --type dg2 --output ./facial_data

# Using default type (dg3)
bun run index.js DG3.bin --output ./my_fingerprints
```

## Dependencies

- [@li0ard/tsemrtd](https://www.npmjs.com/package/@li0ard/tsemrtd): For parsing DG2/DG3 files
- [commander](https://www.npmjs.com/package/commander): For command-line interface

## Note

This tool is designed to work with Bun runtime for file writing operations.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.