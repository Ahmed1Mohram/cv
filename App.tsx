import React, { Suspense } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/UI/Overlay';
import { Loader } from '@react-three/drei';
import { AdminPage } from './components/admin/AdminPage';
import { getSupabase } from './lib/supabaseClient';
import { useStore, type ProjectData } from './store';
import { AnimatePresence, motion } from 'framer-motion';

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
  const projectsFromStore = useStore((s) => s.projects);
  const isAdminLocation = React.useCallback(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    return hash.startsWith('#/admin') || path === '/admin' || path === '/admin/';
  }, []);

  const [isAdminRoute, setIsAdminRoute] = React.useState(() => {
    return isAdminLocation();
  });

  const [projectsFetchDone, setProjectsFetchDone] = React.useState(false);
  const [bootReady, setBootReady] = React.useState(false);
  const [bootTotal, setBootTotal] = React.useState(0);
  const [bootLoaded, setBootLoaded] = React.useState(0);
  const [bootFailed, setBootFailed] = React.useState(0);

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
      try {
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
      } finally {
        if (!cancelled) setProjectsFetchDone(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [setProjects]);

  React.useEffect(() => {
    if (isAdminRoute) return;
    if (!projectsFetchDone) return;

    const fallbackProjects: Array<{ id: number; localScreenshotUrl: string }> = [
      { id: 1, localScreenshotUrl: '/projects/dr-ahmed-mohram.jpg' },
      { id: 2, localScreenshotUrl: '/projects/mohamed-mohram.jpg' },
      { id: 3, localScreenshotUrl: '/projects/fgdfg-livid.jpg' },
      { id: 4, localScreenshotUrl: '/projects/almostaqbal.jpg' },
      { id: 5, localScreenshotUrl: '/projects/azqar.jpg' },
      { id: 6, localScreenshotUrl: '/projects/mohram-ai.jpg' },
      { id: 7, localScreenshotUrl: '/projects/cotch-nasr.jpg' },
    ];
    const fallbackById: Record<number, string> = {};
    for (const p of fallbackProjects) fallbackById[p.id] = p.localScreenshotUrl;

    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? '/';
    const withBase = (u: string) => {
      if (!u) return u;
      if (!u.startsWith('/')) return u;
      const b = String(baseUrl);
      return `${b.replace(/\/$/, '')}${u}`;
    };

    const list = (projectsFromStore && projectsFromStore.length > 0) ? projectsFromStore : fallbackProjects;
    const urls = (list as any[])
      .flatMap((p) => {
        const id = Number(p?.id);
        const primaryRaw = (p?.imageUrl ?? p?.image_url ?? p?.localScreenshotUrl ?? '') as string;
        const fallbackRaw = (fallbackById[id] ?? '') as string;
        const primary = withBase(primaryRaw);
        const fallback = withBase(fallbackRaw);
        return [primary, fallback].filter(Boolean);
      })
      .filter((v, i, a) => a.indexOf(v) === i);

    const total = urls.length;
    setBootTotal(total);
    setBootLoaded(0);
    setBootFailed(0);
    setBootReady(false);

    let cancelled = false;
    const startedAt = Date.now();

    const preloadOne = (url: string) => {
      return new Promise<boolean>((resolve) => {
        let done = false;
        const finish = (ok: boolean) => {
          if (done) return;
          done = true;
          resolve(ok);
        };
        const img = new Image();
        (img as any).decoding = 'async';
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = new URL(url, window.location.href).toString();
        const d: any = (img as any).decode;
        if (typeof d === 'function') {
          (img as any)
            .decode()
            .then(() => finish(true))
            .catch(() => {
              
            });
        }
      });
    };

    const run = async () => {
      if (total === 0) {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 500) await new Promise((r) => setTimeout(r, 500 - elapsed));
        if (!cancelled) setBootReady(true);
        return;
      }

      await Promise.all(
        urls.map(async (u) => {
          const ok = await preloadOne(u);
          if (cancelled) return;
          setBootLoaded((v) => v + 1);
          if (!ok) setBootFailed((v) => v + 1);
        })
      );

      const elapsed = Date.now() - startedAt;
      if (elapsed < 700) await new Promise((r) => setTimeout(r, 700 - elapsed));
      if (!cancelled) setBootReady(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isAdminRoute, projectsFetchDone, projectsFromStore]);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <>
      <div className="relative w-full h-screen h-[100svh] bg-black">
        <AnimatePresence>
          {!bootReady && (
            <motion.div
              key="boot"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-sky-500/15 blur-[90px]" />
                <div className="absolute -bottom-32 left-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
                <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 70% 65%, rgba(125,211,252,0.08), transparent 52%), radial-gradient(circle at 40% 85%, rgba(167,139,250,0.08), transparent 55%)' }} />
              </div>

              <div className="relative w-[min(520px,92vw)] rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-7 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_140px_rgba(0,0,0,0.75)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-white">
                    <div className="text-sm tracking-widest text-white/60">MOHRAM PORTFOLIO</div>
                    <div className="mt-1 text-xl font-bold">جاري تجهيز التجربة...</div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 grid place-items-center">
                    <div className="h-4 w-4 rounded-full bg-white/80 animate-pulse" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-white/65">
                    <span>تحميل صور المشاريع</span>
                    <span>{bootTotal > 0 ? Math.round((bootLoaded / bootTotal) * 100) : 0}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, rgba(125,211,252,0.9), rgba(167,139,250,0.9))' }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${bootTotal > 0 ? Math.round((bootLoaded / bootTotal) * 100) : 0}%` }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="mt-3 text-[11px] text-white/55">
                    {bootTotal > 0 ? `${bootLoaded} / ${bootTotal}` : '...' }
                    {bootFailed > 0 ? `  •  تعذّر تحميل ${bootFailed}` : ''}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Suspense fallback={null}>
          <CanvasErrorBoundary>
            <Experience />
          </CanvasErrorBoundary>
        </Suspense>
        <Overlay />
        
        {/* Built-in DREI loader for assets */}
        {bootReady && (
          <Loader 
              containerStyles={{ background: '#050505' }} 
              innerStyles={{ width: '40vw' }}
              barStyles={{ height: '5px', background: 'white' }}
              dataStyles={{ fontSize: '12px', fontFamily: 'Inter' }}
          />
        )}
      </div>
    </>
  );
}

export default App;
