import type { Metadata } from "next";
import { LegalPage } from "../legalPage";

export const metadata: Metadata = {
  title: "Cookie Policy | Smart Tracker Telematics",
  description: "How Smart Tracker Telematics uses cookies and similar technologies on its websites and services.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      subtitle="This policy explains how Smart Tracker uses cookies and similar technologies to operate, secure, analyse, and improve our websites and services."
      sections={[
        {
          title: "What Cookies Are",
          body: [
            "Cookies are small files stored on your device when you visit a website. Similar technologies include local storage, pixels, tags, and SDK identifiers.",
            "These technologies help websites remember preferences, maintain sessions, protect accounts, understand usage, and improve performance.",
          ],
        },
        {
          title: "How We Use Cookies",
          body: [
            "Essential cookies support login, navigation, security, fraud prevention, load balancing, and basic website functionality.",
            "Analytics cookies help us understand which pages are visited, how users move through the site, and where performance or content can be improved.",
            "Preference cookies may remember settings such as language, region, or interface choices when those features are available.",
          ],
        },
        {
          title: "Third-Party Technologies",
          body: [
            "We may use trusted third-party tools for hosting, analytics, security, customer support, embedded content, or marketing measurement.",
            "Third-party providers may set their own cookies subject to their policies. We work to use reputable providers and limit data collection to legitimate purposes.",
          ],
        },
        {
          title: "Managing Cookies",
          body: [
            "Most browsers let you block, delete, or limit cookies through settings. If you block essential cookies, some parts of the website or service may not work correctly.",
            "Where a cookie banner or preference centre is provided, you can use it to manage non-essential cookie choices.",
            "You can also use browser-level privacy controls, private browsing modes, and device settings to manage tracking technologies.",
          ],
        },
        {
          title: "Updates",
          body: [
            "We may update this Cookie Policy as our website, services, providers, or legal requirements change.",
            "When updates are material, we will take reasonable steps to make the revised policy available and update the effective date.",
          ],
        },
      ]}
    />
  );
}
