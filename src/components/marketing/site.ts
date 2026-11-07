export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/features", label: "โซลูชัน" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/pricing", label: "ราคา" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

/** Project contact from the legacy site. Change here if the team gets a shared inbox. */
export const CONTACT = {
  email: "kesrin9170@gmail.com",
  place: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
  city: "นครราชสีมา ประเทศไทย",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Suranaree+University+of+Technology",
};
