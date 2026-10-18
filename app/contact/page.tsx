import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import EmailLine from "@/components/contact/EmailLine";
import { t } from "@/components/contact/copy";

export const metadata: Metadata = {
  title: t("contact.meta.title"),
  description: t("contact.meta.description"),
  alternates: { canonical: "/contact/" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader label={t("contact.label")} title={t("contact.title")} intro={t("contact.intro")} />

      <div className="mt-12 max-w-[36rem]">
        {/* Without JS the form block is hidden (it could only send a GET to
            this page) and the noscript sentence takes its place. */}
        <noscript>
          <style>{".js-only{display:none}"}</style>
          <EmailLine id="contact.noscript" />
        </noscript>
        <div className="js-only reading-veil">
          <ContactForm />
        </div>
        <EmailLine id="contact.alt" />
      </div>
    </div>
  );
}
