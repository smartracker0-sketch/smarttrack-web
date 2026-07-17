import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNavPage, getNavSection } from "../../navContent";
import { NavDetailPage } from "../../navPageComponents";

type PageProps = { params: Promise<{ slug: string }> };
const section = getNavSection("resources")!;

export function generateStaticParams() {
  return section.pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getNavPage("resources", slug);
  return page ? { title: `${page.label} | Smart Tracker Resources`, description: page.summary } : { title: "Resource Not Found | Smart Tracker" };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getNavPage("resources", slug);
  if (!page) notFound();
  return <NavDetailPage section={section} page={page} />;
}
