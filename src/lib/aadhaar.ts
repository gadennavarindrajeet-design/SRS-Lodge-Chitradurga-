/**
 * Aadhaar QR Data Parser
 * Handles both old XML format and provides structure for future secure QR support.
 */

export interface AadhaarData {
  uid?: string;
  name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  phone?: string;
}

export function parseAadhaarQR(data: string): AadhaarData {
  const result: AadhaarData = {};

  // 1. Try parsing as XML (Old Aadhaar QR format)
  if (data.includes('<PrintLetterBarcodeData')) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      const node = xmlDoc.getElementsByTagName("PrintLetterBarcodeData")[0];

      if (node) {
        result.uid = node.getAttribute("uid") || undefined;
        result.name = node.getAttribute("name") || undefined;
        result.dob = node.getAttribute("dob") || undefined;
        result.gender = node.getAttribute("gender") || undefined;
        
        // Construct address
        const house = node.getAttribute("house") || "";
        const street = node.getAttribute("street") || "";
        const lm = node.getAttribute("lm") || "";
        const vtc = node.getAttribute("vtc") || "";
        const po = node.getAttribute("po") || "";
        const dist = node.getAttribute("dist") || "";
        const state = node.getAttribute("state") || "";
        const pc = node.getAttribute("pc") || "";

        result.address = [house, street, lm, vtc, po, dist, state, pc]
          .filter(Boolean)
          .join(", ");
      }
    } catch (e) {
      console.error("Failed to parse Aadhaar XML", e);
    }
  } 
  // 2. Fallback for simple text or other formats
  else {
    // Some QR codes might just be a string of values or JSON
    try {
      if (data.startsWith('{')) {
        const json = JSON.parse(data);
        result.uid = json.uid || json.aadhaar;
        result.name = json.name;
        result.dob = json.dob;
        result.gender = json.gender;
        result.address = json.address;
      }
    } catch (e) {
      // Not JSON
    }
  }

  return result;
}
