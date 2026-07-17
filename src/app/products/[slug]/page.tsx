import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNavPage, getNavSection } from "../../navContent";
import { NavDetailPage } from "../../navPageComponents";

type PageProps = { params: Promise<{ slug: string }> };
const section = getNavSection("products")!;

export function generateStaticParams() {
  return section.pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getNavPage("products", slug);
  return page ? { title: `${page.label} | Smart Tracker Products`, description: page.summary } : { title: "Product Not Found | Smart Tracker" };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getNavPage("products", slug);
  if (!page) notFound();
  return <NavDetailPage section={section} page={page} />;
}
