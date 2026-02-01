import React, { Suspense } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/UI/Overlay';
import { Loader } from '@react-three/drei';
import { AdminPage } from './components/admin/AdminPage';
import { getSupabase } from './lib/supabaseClient';
import { useStore, type ProjectData } from './store';

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error('[CanvasErrorBoundary] Canvas crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm bg-black">
          WebGL غير متاح حالياً. جرّب تفعيل Hardware Acceleration أو افتح الموقع بمتصفح آخر.
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const setProjects = useStore((s) => s.setProjects);
  const isAdminLocation = React.useCallback(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    return hash.startsWith('#/admin') || path === '/admin' || path === '/admin/';
  }, []);

  const [isAdminRoute, setIsAdminRoute] = React.useState(() => {
    return isAdminLocation();
  });

  React.useEffect(() => {
    const onHashChange = () => {
      setIsAdminRoute(isAdminLocation());
    };
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, [isAdminLocation]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const supabase = await getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('projects')
        .select('id,title,subtitle,desc,details,stack,live_url,github_url,image_url,sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (cancelled) return;
      if (error) return;

      const mapped: ProjectData[] = ((data as any[]) ?? []).map((row) => ({
        id: row.id,
        title: row.title ?? '',
        subtitle: row.subtitle ?? '',
        desc: row.desc ?? '',
        details: row.details ?? null,
        stack: Array.isArray(row.stack) ? row.stack : [],
        liveUrl: row.live_url ?? '',
        githubUrl: row.github_url ?? null,
        imageUrl: row.image_url ?? null,
        sortOrder: row.sort_order ?? null,
      }));

      setProjects(mapped);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [setProjects]);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <>
      <div className="relative w-full h-screen h-[100svh] bg-black">
        <Suspense fallback={null}>
          <CanvasErrorBoundary>
            <Experience />
          </CanvasErrorBoundary>
        </Suspense>
        <Overlay />
        
        {/* Built-in DREI loader for assets */}
        <Loader 
            containerStyles={{ background: '#050505' }} 
            innerStyles={{ width: '40vw' }}
            barStyles={{ height: '5px', background: 'white' }}
            dataStyles={{ fontSize: '12px', fontFamily: 'Inter' }}
        />
      </div>
    </>
  );
}

export default App;
