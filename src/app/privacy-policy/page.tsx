import type { Metadata } from "next";
import { LegalPage } from "../legalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Smart Tracker Telematics",
  description: "How Smart Tracker Telematics collects, uses, protects, and shares personal and fleet data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="This policy explains how Smart Tracker Telematics handles account, fleet, device, telemetry, support, and website information."
      sections={[
        {
          title: "Information We Collect",
          body: [
            "We may collect account details such as name, email address, phone number, organisation information, billing contact details, and support messages.",
            "When you use Smart Tracker services, we process fleet and device data such as vehicle identifiers, GPS location, trip history, geofence events, alerts, fuel readings, driver scorecard data, device status, and related operational records.",
            "Our website may collect technical information such as browser type, IP address, pages viewed, referral source, and approximate location for security, analytics, and service improvement.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "We use information to provide tracking, alerts, dashboards, reports, device activation, customer support, billing, security monitoring, and product improvement.",
            "Fleet data is used to show live status, route history, safety events, fuel analytics, geofence activity, and other operational insights selected by your organisation.",
            "We may use contact information to send service messages, product updates, security notices, invoices, and support communications.",
          ],
        },
        {
          title: "Sharing and Disclosure",
          body: [
            "We do not sell personal information. We may share information with trusted service providers that help us host, secure, support, analyse, or deliver the platform.",
            "Customer-controlled users within your organisation may access fleet data according to their permissions. Your organisation is responsible for configuring users and access rights appropriately.",
            "We may disclose information where required by law, to protect rights and safety, to investigate misuse, or in connection with a business transaction such as a merger or acquisition.",
          ],
        },
        {
          title: "Data Security and Retention",
          body: [
            "We use administrative, technical, and organisational safeguards designed to protect information from unauthorised access, misuse, loss, or alteration.",
            "We retain information for as long as needed to provide the service, meet legal obligations, resolve disputes, enforce agreements, and support legitimate business operations.",
            "No system is perfectly secure. Customers should use strong passwords, protect account access, and promptly notify us of suspected unauthorised use.",
          ],
        },
        {
          title: "Your Choices",
          body: [
            "You may request access, correction, deletion, or export of personal information where applicable law provides those rights.",
            "Marketing communications can be opted out of using the unsubscribe instructions in the message or by contacting us.",
            "Some operational messages, security notices, and billing communications are necessary for the service and may still be sent.",
          ],
        },
      ]}
    />
  );
}
