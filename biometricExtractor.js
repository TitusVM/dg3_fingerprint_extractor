/**
 * Biometric Data Extractor for browser environments
 * Provides functions to extract DG2 (facial) and DG3 (fingerprint) data
 * from electronic travel document data files
 */

import { DG2, DG3 } from './node_modules/@li0ard/tsemrtd/dist/index.js'
import {
  FingerType,
  FingerImageType
} from './node_modules/@li0ard/tsemrtd/dist/consts/enums.js'

const BiometricExtractor = {
  /**
   * Extracts fingerprint data from a DG3 descriptor
   * @param {ArrayBuffer} fileBuffer - The DG3 file buffer
   * @returns {Promise<Array>} Array of fingerprint objects
   */
  extractDG3: async function (fileBuffer) {
    try {
      const rawData = new Uint8Array(fileBuffer)
      const hexData = Array.from(rawData)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
      const fingerprint = DG3.load(hexData)
      return fingerprint.map(finger => {
        const fpType = FingerType[finger.fingerType]
        const fpImageType = finger.fingerImageType

        return {
          type: fpType,
          icaoType: this.getBiometricType(finger.sbh.type),
          icaoSubtype: this.getBiometricSubtype(finger.sbh.sutype),
          resolution: `${finger.imageResolutionVertical}x${finger.imageResolutionHorizontal}`,
          quality: `${finger.quality}%`,
          imageType: FingerImageType[fpImageType],
          imageData: finger.imageData, // Binary image data
          fingerType: finger.fingerType // Original enum value
        }
      })
    } catch (error) {
      console.error('Error extracting DG3 data:', error)
      throw error
    }
  },

  /**
   * Extracts facial image data from a DG2 descriptor
   * @param {ArrayBuffer} fileBuffer - The DG2 file buffer
   * @returns {Promise<Array>} Array of face image objects
   */
  extractDG2: async function (fileBuffer) {
    try {
      const rawData = new Uint8Array(fileBuffer)
      const hexData = Array.from(rawData)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      const faceData = DG2.load(hexData)
      return faceData.map((face, index) => {
        return {
          index,
          imageData: face.imageData, // Binary image data
          type: 'FACE',
          format: 'JP2', // JPEG2000 format
          // Add other available face data properties here
          width: face.imageWidth,
          height: face.imageHeight,
        }
      })
    } catch (error) {
      console.error('Error extracting DG2 data:', error)
      throw error
    }
  },

  /**
   * Gets the biometric type description based on ICAO code
   * Based on NIST IR 6529-A Table 4
   * @param {number} code - The biometric type code
   * @returns {string} The biometric type description
   */
  getBiometricType: function (code) {
    if (code === 8) {
      return 'Fingerprint'
    } else {
      return 'Unknown biometric type: ' + code
    }
  },

  /**
   * Gets the biometric subtype description based on ICAO code
   * Based on NIST IR 6529-A Table 6
   * @param {number} code - The biometric subtype code
   * @returns {string} The biometric subtype description
   */
  getBiometricSubtype: function (code) {
    // Check if code is 0 (no information)
    if (code === 0) {
      return 'No information given'
    }

    // Extract the relevant bits for position (right/left)
    const position = code & 0b11 // Extract b2 and b1

    // Extract finger type (bits b5, b4, b3)
    const fingerType = (code >> 2) & 0b111 // Shift right by 2 and mask with 111

    let result = ''

    // Determine position (right/left)
    if (position === 0b01) {
      result = 'Right '
    } else if (position === 0b10) {
      result = 'Left '
    }

    // Determine finger type
    switch (fingerType) {
      case 0b000:
        return result ? result.trim() : 'No meaning'
      case 0b001:
        result += 'Thumb'
        break
      case 0b010:
        result += 'Pointer finger'
        break
      case 0b011:
        result += 'Middle finger'
        break
      case 0b100:
        result += 'Ring finger'
        break
      case 0b101:
        result += 'Little finger'
        break
      default:
        return 'Reserved for future use'
    }

    return result
  },

  /**
   * Creates a download URL for binary data
   * @param {ArrayBuffer} data - Binary data
   * @param {string} mimeType - MIME type of the data
   * @returns {string} Object URL for downloading
   */
  createDownloadUrl: function (data, mimeType) {
    const blob = new Blob([data], { type: mimeType })
    return URL.createObjectURL(blob)
  }
}

export default BiometricExtractor
