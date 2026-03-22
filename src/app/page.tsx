'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, FileCode2, ExternalLink, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [amount, setAmount] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(setProjects);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    try {
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, amount })
      });
      const data = await generateRes.json();
      
      if (data.error) throw new Error(data.error);
      
      const saveRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${prompt} (${amount ? "$" + amount : "Free"})`, html: data.html, css: '' })
      });
      const project = await saveRes.json();
      
      router.push(`/editor/${project.id}`);
    } catch (err: any) {
      alert(err.message || 'Error generating page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-center gap-3 border-b border-neutral-800 pb-6">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            AI Website Builder
          </h1>
        </header>

        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            Create a New Website
          </h2>
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A dark theme landing page for a SaaS product..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              disabled={loading}
              required
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (e.g. 99)"
              className="w-full sm:w-32 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              disabled={loading}
              required
              min="1"
            />
            <button 
              type="submit" 
              disabled={loading || !prompt || !amount}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors min-w-[140px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Generate</span>}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-neutral-400" />
            Saved Projects
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl text-neutral-500">
              No projects yet. Generate your first website above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="group flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors">
                  <div 
                    className="h-32 mb-4 bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden relative group-hover:bg-indigo-500/5 transition-colors cursor-pointer" 
                    onClick={() => router.push(`/editor/${p.id}`)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-700">
                      <ExternalLink className="w-8 h-8 opacity-50 block group-hover:scale-110 group-hover:text-indigo-400 transition-all"/>
                    </div>
                  </div>
                  <h3 className="font-medium text-neutral-200 line-clamp-1 flex-1" title={p.prompt}>{p.prompt}</h3>
                  <p className="text-xs text-neutral-500 mt-2 mb-4">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => router.push(`/editor/${p.id}`)}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit 
                    </button>
                    <button 
                      onClick={() => window.open(`/p/${p.id}`, '_blank')}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" /> Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
