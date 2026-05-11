import CourseClient from "./CourseClient";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseClient id={id} />;
}
