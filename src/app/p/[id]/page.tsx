import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function PublishedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await prisma.project.findUnique({
    where: { id }
  });

  if (!project) {
    notFound();
  }

  // Inject Tailwind CSS via CDN simply to make the generated styles work for now
  // Combine custom css and html
  return (
    <>
      <head>
        <title>{project.prompt.split(' (')[0]}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: project.css || '' }} />
      </head>
      <body dangerouslySetInnerHTML={{ __html: project.html }} />
    </>
  );
}
