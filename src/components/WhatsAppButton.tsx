import whatsappIcon from "@/assets/icons/whatsapp-icon.png";

const message = encodeURIComponent(
  `Hello SLV Group,

I came across your website and I'm interested in learning more about your projects.

Could you please share details regarding:
• Available properties
• Pricing and payment plans
• Project locations
• Site visit availability

Looking forward to hearing from you.

Thank you.`,
);

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/919859595939?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-2 right-4 z-40 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 sm:bottom-6 sm:right-6"
    >
      <img src={whatsappIcon} alt="WhatsApp" className="h-8 w-8" />
    </a>
  );
}
