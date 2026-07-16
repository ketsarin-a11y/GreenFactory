import type { Metadata } from "next";
import ContactExperience from "@/components/contact/ContactExperience";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description:
    "",
};

export default function ContactPage() {
  return <ContactExperience />;
}
