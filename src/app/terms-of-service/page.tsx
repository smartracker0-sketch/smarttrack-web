import type { Metadata } from "next";
import { LegalPage } from "../legalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Smart Tracker Telematics",
  description: "Terms governing access to and use of Smart Tracker Telematics websites, apps, devices, APIs, and services.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="These terms govern your access to Smart Tracker websites, applications, dashboards, devices, APIs, and related fleet services."
      sections={[
        {
          title: "Use of the Service",
          body: [
            "You may use Smart Tracker only for lawful business purposes and in accordance with these terms, applicable orders, documentation, and any agreement with us.",
            "You are responsible for the accuracy of information you provide, the activity under your account, and the way your organisation configures users, vehicles, devices, and permissions.",
            "You must not misuse the service, attempt unauthorised access, interfere with platform security, reverse engineer protected systems, or use the platform to violate rights or laws.",
          ],
        },
        {
          title: "Fleet Data and Customer Content",
          body: [
            "Your organisation retains responsibility for fleet data, vehicle records, driver information, uploaded content, and operational decisions made using the platform.",
            "You grant Smart Tracker the rights needed to host, process, transmit, display, analyse, and secure customer content only as necessary to provide and improve the service.",
            "You are responsible for notifying drivers, employees, contractors, and other relevant people where tracking, dashcams, or telematics processing requires notice or consent.",
          ],
        },
        {
          title: "Subscriptions, Devices, and Availability",
          body: [
            "Access to some features may require active subscriptions, compatible devices, network connectivity, correct installation, and current payment status.",
            "We aim to keep the service reliable, but availability may be affected by maintenance, carrier networks, GPS conditions, third-party services, hardware issues, or events outside our control.",
            "Hardware, installation, SIM, SMS, mapping, storage, and integration terms may vary by plan, region, and contract.",
          ],
        },
        {
          title: "Limitations",
          body: [
            "Smart Tracker supports fleet visibility and decision-making but does not replace professional judgement, legal compliance, driver responsibility, emergency services, or insurance requirements.",
            "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, punitive, or lost-profit damages.",
            "Our aggregate liability is limited according to the applicable contract, order form, or the fees paid for the affected service where no separate agreement applies.",
          ],
        },
        {
          title: "Changes and Termination",
          body: [
            "We may update the service and these terms from time to time. Material changes will be communicated through reasonable channels.",
            "We may suspend or terminate access if accounts are misused, fees are unpaid, security is at risk, or laws or agreements are violated.",
            "Sections intended to survive termination, including payment, confidentiality, limitation of liability, and dispute provisions, will continue to apply.",
          ],
        },
      ]}
    />
  );
}
