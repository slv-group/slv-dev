/**
 * International Country Codes & Phone Helpers
 * Sensible default for Indian visitors (+91) with NRI & international support.
 */

export interface CountryCode {
  code: string; // e.g. "+91"
  iso: string; // e.g. "IN"
  name: string; // e.g. "India"
  flag: string; // e.g. "🇮🇳"
  format: string; // e.g. "98595 95939"
  digits: [number, number]; // min, max digits
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "+91", iso: "IN", name: "India", flag: "🇮🇳", format: "98595 95939", digits: [10, 10] },
  {
    code: "+1",
    iso: "US",
    name: "USA / Canada",
    flag: "🇺🇸",
    format: "202 555 0123",
    digits: [10, 10],
  },
  {
    code: "+44",
    iso: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    format: "7911 123456",
    digits: [10, 11],
  },
  {
    code: "+971",
    iso: "AE",
    name: "UAE (Dubai)",
    flag: "🇦🇪",
    format: "50 123 4567",
    digits: [9, 9],
  },
  {
    code: "+966",
    iso: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    format: "50 123 4567",
    digits: [9, 9],
  },
  { code: "+974", iso: "QA", name: "Qatar", flag: "🇶🇦", format: "3312 3456", digits: [8, 8] },
  { code: "+965", iso: "KW", name: "Kuwait", flag: "🇰🇼", format: "9123 4567", digits: [8, 8] },
  { code: "+968", iso: "OM", name: "Oman", flag: "🇴🇲", format: "9123 4567", digits: [8, 8] },
  { code: "+973", iso: "BH", name: "Bahrain", flag: "🇧🇭", format: "3912 3456", digits: [8, 8] },
  { code: "+65", iso: "SG", name: "Singapore", flag: "🇸🇬", format: "8123 4567", digits: [8, 8] },
  { code: "+61", iso: "AU", name: "Australia", flag: "🇦🇺", format: "412 345 678", digits: [9, 10] },
  { code: "+60", iso: "MY", name: "Malaysia", flag: "🇲🇾", format: "12 345 6789", digits: [9, 10] },
  { code: "+49", iso: "DE", name: "Germany", flag: "🇩🇪", format: "151 23456789", digits: [10, 11] },
];

export const DEFAULT_COUNTRY_CODE = "+91";

export const ENQUIRY_TYPES = ["Residential", "Commercial", "Plots", "Others"] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

/**
 * Validates a phone number given a country code.
 */
export function validatePhoneNumber(
  phone: string,
  countryCode: string,
): { isValid: boolean; error?: string } {
  const cleaned = phone.replace(/[^\d]/g, "");

  if (!cleaned) {
    return { isValid: false, error: "Phone number is required" };
  }

  const country = COUNTRY_CODES.find((c) => c.code === countryCode);

  if (countryCode === "+91") {
    if (cleaned.length !== 10) {
      return { isValid: false, error: "Please enter a valid 10-digit Indian mobile number" };
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return { isValid: false, error: "Indian mobile numbers should start with 6, 7, 8, or 9" };
    }
    return { isValid: true };
  }

  if (country) {
    const [min, max] = country.digits;
    if (cleaned.length < min || cleaned.length > max) {
      return {
        isValid: false,
        error: `Please enter a valid phone number for ${country.name} (${min}${min === max ? "" : `-${max}`} digits)`,
      };
    }
    return { isValid: true };
  }

  // Fallback for custom/other country codes: 6 to 15 digits (ITU-T E.164)
  if (cleaned.length < 6 || cleaned.length > 15) {
    return { isValid: false, error: "Please enter a valid phone number (6-15 digits)" };
  }

  return { isValid: true };
}

/**
 * Formats country code and phone number into a single canonical international string.
 * Prevents duplicate country codes.
 */
export function formatInternationalPhone(countryCode: string, phone: string): string {
  let cleaned = phone.trim();

  // If user already typed the country code into the input, strip it to avoid duplication
  const codeDigits = countryCode.replace("+", "");
  if (cleaned.startsWith(countryCode)) {
    cleaned = cleaned.slice(countryCode.length).trim();
  } else if (cleaned.startsWith(codeDigits)) {
    cleaned = cleaned.slice(codeDigits.length).trim();
  } else if (cleaned.startsWith("00" + codeDigits)) {
    cleaned = cleaned.slice(("00" + codeDigits).length).trim();
  }

  // Remove non-digit characters from the phone part
  const digitsOnly = cleaned.replace(/[^\d]/g, "");

  return `${countryCode} ${digitsOnly}`.trim();
}

/**
 * Validates an email address.
 * Returns true if empty/blank (because email is optional) or if a valid email format is supplied.
 */
export function validateOptionalEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: true }; // Optional field!
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address or leave it blank" };
  }

  return { isValid: true };
}

/**
 * Prevents city duplication in location displays.
 * e.g. "Purushothapatnam, Gannavaram" + "Gannavaram" => "Purushothapatnam, Gannavaram"
 * "Bhimavaram" + "Bhimavaram" => "Bhimavaram"
 */
export function formatLocationCity(location?: string | null, city?: string | null): string {
  const loc = (location || "").trim();
  const c = (city || "").trim();

  if (!loc && !c) return "";
  if (!c) return loc;
  if (!loc) return c;

  const locLower = loc.toLowerCase();
  const cLower = c.toLowerCase();

  if (locLower === cLower || locLower.endsWith(cLower) || locLower.includes(cLower)) {
    return loc;
  }

  return `${loc}, ${c}`;
}
