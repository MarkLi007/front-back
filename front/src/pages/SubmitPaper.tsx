
--- a/front/src/pages/SubmitPaper.tsx
+++ b/front/src/pages/SubmitPaper.tsx


import { graph } from '@/utils/graph';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitPaper() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError(null);

    try {
      const paperData = {
        title,
        author,
        abstract,
        content,
      };
      await graph.addPaper(paperData);

      // Redirect to MyPapers page on successful submission
      router.push('/MyPapers');
      // Clear form
      setTitle('');
      setAuthor('');
      setAbstract('');
      setContent('');
    } catch (err: any) {
      setError('Failed to submit paper');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 w-full" required />
      </div>
      <div>
        <label htmlFor="author">Author:</label>
        <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 w-full" required />
      </div>
      <div>
        <label htmlFor="abstract">Abstract:</label>
        <textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 w-full" required></textarea>
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 w-full" required></textarea>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <Button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">Submit</Button>
    </form>
  );
}
