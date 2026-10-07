import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseClient from "./CourseClient";
import { courses } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const c = courses.find((x) => x.id === id);
  return c ? { title: c.title, description: c.description } : {};
}

export default async function CoursePage({ params }: Params) {
  const { id } = await params;
  if (!courses.some((c) => c.id === id)) notFound();
  return <CourseClient id={id} />;
}
