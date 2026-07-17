import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNavPage, getNavSection } from "../../navContent";
import { NavDetailPage } from "../../navPageComponents";

type PageProps = { params: Promise<{ slug: string }> };
const section = getNavSection("company")!;

export function generateStaticParams() {
  return section.pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getNavPage("company", slug);
  return page ? { title: `${page.label} | Smart Tracker Company`, description: page.summary } : { title: "Company Page Not Found | Smart Tracker" };
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getNavPage("company", slug);
  if (!page) notFound();
  return <NavDetailPage section={section} page={page} />;
}
