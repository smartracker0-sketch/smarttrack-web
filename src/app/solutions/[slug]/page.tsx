import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNavPage, getNavSection } from "../../navContent";
import { NavDetailPage } from "../../navPageComponents";

type PageProps = { params: Promise<{ slug: string }> };
const section = getNavSection("solutions")!;

export function generateStaticParams() {
  return section.pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getNavPage("solutions", slug);
  return page ? { title: `${page.label} | Smart Tracker Solutions`, description: page.summary } : { title: "Solution Not Found | Smart Tracker" };
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getNavPage("solutions", slug);
  if (!page) notFound();
  return <NavDetailPage section={section} page={page} />;
}
