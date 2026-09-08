const configuredName = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
const configuredShortName = process.env.NEXT_PUBLIC_SITE_SHORT_NAME?.trim();

export const publicConfig = {
  name: !configuredName || /^Atlas Learning/i.test(configuredName) ? "4Z Academy" : configuredName,
  shortName: !configuredShortName || configuredShortName.toUpperCase() === "ATLAS" ? "4Z" : configuredShortName,
  supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "201000000000",
};
