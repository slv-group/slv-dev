import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Phone,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface SocialLinkInfo {
  label: string;
  url: string;
  icon: LucideIcon;
  ariaLabel: string;
}

/**
 * Official SLV Group Social Media & Contact Links
 *
 * URLs should be updated with verified official accounts when available.
 * Set via environment variables VITE_FACEBOOK_URL and VITE_INSTAGRAM_URL,
 * or configure directly in this file.
 */
export const SOCIAL_LINKS = {
  facebook: {
    label: "Facebook",
    // Official Facebook page URL (placeholder until verified official URL is provided)
    url: (import.meta.env.VITE_FACEBOOK_URL as string) || "https://www.facebook.com/slvgroup",
    icon: Facebook,
    ariaLabel: "Follow SLV Group on Facebook",
  },
  instagram: {
    label: "Instagram",
    // Official Instagram page URL (placeholder until verified official URL is provided)
    url: (import.meta.env.VITE_INSTAGRAM_URL as string) || "https://www.instagram.com/slvgroup",
    icon: Instagram,
    ariaLabel: "Follow SLV Group on Instagram",
  },
  linkedin: {
    label: "LinkedIn",
    url:
      (import.meta.env.VITE_LINKEDIN_URL as string) || "https://www.linkedin.com/company/slv-group",
    icon: Linkedin,
    ariaLabel: "Follow SLV Group on LinkedIn",
  },
  whatsapp: {
    label: "WhatsApp",
    phone: "919859595939",
    url: "https://wa.me/919859595939",
    icon: MessageCircle,
    ariaLabel: "Chat with SLV Group on WhatsApp",
  },
  phone: {
    label: "Phone",
    value: "+91 98595 95939",
    href: "tel:+919859595939",
    icon: Phone,
  },
  email: {
    label: "Email",
    value: "info@slvgroup.co.in",
    href: "mailto:info@slvgroup.co.in",
    icon: Mail,
  },
};

export const OFFICE_ADDRESS = {
  name: "SLV Group Office",
  line1: "Ground Floor, SLV Tummala Complex,",
  line2: "Opp. SLV PNB Commercial, Gunadala,",
  line3: "Inner Ring Road, Vijayawada,",
  line4: "NTR District, Andhra Pradesh – 520004.",
  fullText:
    "Ground Floor, SLV Tummala Complex, Opp. SLV PNB Commercial, Gunadala, Inner Ring Road, Vijayawada, NTR District, Andhra Pradesh – 520004.",
  city: "Vijayawada",
  locality: "Gunadala",
  district: "NTR District",
  state: "Andhra Pradesh",
  pincode: "520004",
  country: "IN",
} as const;
