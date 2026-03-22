'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import grapesjs from 'grapesjs';
import webpagePlugin from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';
import { Save, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const editorRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('Loading...');
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(project => {
        if (!mounted) return;
        if (!project || project.error) {
          alert('Project not found');
          router.push('/');
          return;
        }

        setProjectName(project.prompt);
        setProjectData(project);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id, router]);

  useEffect(() => {
    if (!loading && projectData && !editorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: false, // We'll handle saving manually
        plugins: [webpagePlugin],
        components: projectData.html,
        style: projectData.css || '',
        canvas: {
          scripts: ['https://cdn.tailwindcss.com']
        }
      });
      
      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [loading, projectData]);

  const handleSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, css })
      });
    } catch (err) {
      alert('Error saving project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      <header className="flex-none h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 text-white">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        
        <div className="flex gap-2 text-sm font-medium text-neutral-400 truncate max-w-md">
          {projectName}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => window.open(`/p/${id}`, '_blank')}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Live View
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden relative bg-black">
        <div id="gjs" className="h-[calc(100vh-3.5rem)]"></div>
      </div>
    </div>
  );
}
