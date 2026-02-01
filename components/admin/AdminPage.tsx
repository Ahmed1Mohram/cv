import React from 'react';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useStore, type ProjectData } from '../../store';

type DbProjectRow = {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  details: string | null;
  stack: string[] | null;
  live_url: string;
  github_url: string | null;
  image_url: string | null;
  sort_order: number | null;
};

const mapRowToProject = (row: DbProjectRow): ProjectData => ({
  id: row.id,
  title: row.title ?? '',
  subtitle: row.subtitle ?? '',
  desc: row.desc ?? '',
  details: row.details,
  stack: row.stack ?? [],
  liveUrl: row.live_url ?? '',
  githubUrl: row.github_url,
  imageUrl: row.image_url,
  sortOrder: row.sort_order,
});

const DEFAULT_PROJECTS_SEED = [
  {
    id: 1,
    title: 'موقع د. أحمد محرم',
    subtitle: 'موقع تعريفي احترافي وتجربة مستخدم سلسة',
    desc: 'موقع تعريفي احترافي يبرز الهوية والخدمات مع تجربة مستخدم واضحة وسريعة.',
    details: null,
    stack: ['واجهة', 'أداء', 'تجربة مستخدم'],
    live_url: 'https://dr-ahmed-mohram.vercel.app/',
    github_url: null,
    image_url: '/projects/dr-ahmed-mohram.jpg',
    sort_order: 0,
  },
  {
    id: 2,
    title: 'بورتفوليو محمد محرم',
    subtitle: 'واجهة حديثة مع انتقالات ناعمة وأداء سريع',
    desc: 'بورتفوليو تفاعلي بتصميم عصري وانتقالات ناعمة وتركيز على السلاسة.',
    details: null,
    stack: ['UI', 'Motion', 'Responsive'],
    live_url: 'https://mohamed-mohram.vercel.app/',
    github_url: null,
    image_url: '/projects/mohamed-mohram.jpg',
    sort_order: 1,
  },
  {
    id: 3,
    title: 'مشروع تجريبي',
    subtitle: 'تجارب واجهات وتفاعلات لتطوير الفكرة',
    desc: 'مساحة لتجارب الواجهات والتفاعلات قبل نقلها لمشاريع الإنتاج.',
    details: null,
    stack: ['Prototype', 'UI', 'Iteration'],
    live_url: 'https://fgdfg-livid.vercel.app/',
    github_url: null,
    image_url: '/projects/fgdfg-livid.jpg',
    sort_order: 2,
  },
  {
    id: 4,
    title: 'المستقبل',
    subtitle: 'موقع محتوى/خدمات مع تنظيم واضح للأقسام',
    desc: 'موقع محتوى/خدمات مع تنظيم أقسام واضح وتجربة قراءة مريحة.',
    details: null,
    stack: ['Content', 'UX', 'Performance'],
    live_url: 'https://www.almostaqbal.net/',
    github_url: null,
    image_url: '/projects/almostaqbal.jpg',
    sort_order: 3,
  },
  {
    id: 5,
    title: 'أذكار',
    subtitle: 'تجربة بسيطة وسريعة لقراءة الأذكار',
    desc: 'تجربة خفيفة وسريعة لعرض الأذكار بتصميم بسيط وعملي.',
    details: null,
    stack: ['Simple', 'Fast', 'Mobile'],
    live_url: 'https://azqar.vercel.app/',
    github_url: null,
    image_url: '/projects/azqar.jpg',
    sort_order: 4,
  },
  {
    id: 6,
    title: 'Mohram AI',
    subtitle: 'تجربة ذكاء اصطناعي بواجهة نظيفة وسريعة',
    desc: 'واجهة نظيفة لتجربة ذكاء اصطناعي مع تركيز على السرعة والوضوح.',
    details: null,
    stack: ['AI', 'UI', 'Speed'],
    live_url: 'https://mohram-ai.vercel.app/',
    github_url: null,
    image_url: '/projects/mohram-ai.jpg',
    sort_order: 5,
  },
  {
    id: 7,
    title: 'كوتش نصر',
    subtitle: 'صفحة هبوط تركّز على التحويل والثقة',
    desc: 'صفحة هبوط لعرض الخدمة وبناء الثقة مع دعوة واضحة لاتخاذ إجراء.',
    details: null,
    stack: ['Landing', 'Conversion', 'Brand'],
    live_url: 'https://cotch-nasr.vercel.app/',
    github_url: null,
    image_url: '/projects/cotch-nasr.jpg',
    sort_order: 6,
  },
];

export const AdminPage: React.FC = () => {
  const setProjects = useStore((s) => s.setProjects);

  const [supabase, setSupabase] = React.useState<any | null>(null);

  const [routeError, setRouteError] = React.useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = React.useState<string | null>(null);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authBusy, setAuthBusy] = React.useState(false);

  const [busy, setBusy] = React.useState(false);
  const [items, setItems] = React.useState<ProjectData[]>([]);

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [stackCsv, setStackCsv] = React.useState('');
  const [liveUrl, setLiveUrl] = React.useState('');
  const [githubUrl, setGithubUrl] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<number>(0);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState('');

  const resetForm = React.useCallback(() => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setDesc('');
    setDetails('');
    setStackCsv('');
    setLiveUrl('');
    setGithubUrl('');
    setSortOrder(0);
    setImageFile(null);
    setImageUrl('');
  }, []);

  const loadProjects = React.useCallback(async () => {
    if (!supabase) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id,title,subtitle,desc,details,stack,live_url,github_url,image_url,sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      const mapped = (data as DbProjectRow[] | null)?.map(mapRowToProject) ?? [];
      setItems(mapped);
      setProjects(mapped);
    } catch (e: any) {
      setRouteError(e?.message ?? 'Failed to load projects');
    } finally {
      setBusy(false);
    }
  }, [setProjects, supabase]);

  const seedDefaults = async () => {
    if (!supabase) return;
    setBusy(true);
    setRouteError(null);
    try {
      const { error } = await supabase.from('projects').upsert(DEFAULT_PROJECTS_SEED, { onConflict: 'id' });
      if (error) throw error;
      await loadProjects();
    } catch (e: any) {
      setRouteError(e?.message ?? 'Seed failed');
    } finally {
      setBusy(false);
    }
  };

  const deleteAllProjects = async () => {
    if (!supabase) return;
    const ok = window.confirm('مسح كل المشاريع من قاعدة البيانات؟');
    if (!ok) return;
    setBusy(true);
    setRouteError(null);
    try {
      const { error } = await supabase.from('projects').delete().neq('id', -1);
      if (error) throw error;
      await loadProjects();
      resetForm();
    } catch (e: any) {
      setRouteError(e?.message ?? 'Delete all failed');
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRouteError('Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
      return;
    }

    let cancelled = false;
    getSupabase().then((c) => {
      if (cancelled) return;
      if (!c) {
        setRouteError('Failed to init Supabase client');
        return;
      }
      setSupabase(c);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!supabase) return;

    let unsub: any = null;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      setSessionEmail((s?.user?.email as string | undefined) ?? null);

      unsub = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSessionEmail((nextSession?.user?.email as string | undefined) ?? null);
      });
    };

    init();

    return () => {
      if (unsub?.data?.subscription) unsub.data.subscription.unsubscribe();
    };
  }, [supabase]);

  React.useEffect(() => {
    if (sessionEmail) loadProjects();
  }, [sessionEmail, loadProjects]);

  const signIn = async () => {
    if (!supabase) return;
    setAuthBusy(true);
    setRouteError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setEmail('');
      setPassword('');
    } catch (e: any) {
      setRouteError(e?.message ?? 'Sign in failed');
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    setAuthBusy(true);
    try {
      await supabase.auth.signOut();
      setItems([]);
      setProjects([]);
      resetForm();
    } finally {
      setAuthBusy(false);
    }
  };

  const uploadIfNeeded = async (): Promise<string | null> => {
    if (!supabase) return null;
    if (!imageFile) return imageUrl ? imageUrl : null;

    const ext = imageFile.name.split('.').pop() || 'jpg';
    const filePath = `projects/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('project-images')
      .upload(filePath, imageFile, { upsert: false, contentType: imageFile.type || 'image/jpeg' });

    if (upErr) throw upErr;

    const { data } = supabase.storage.from('project-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const upsertProject = async () => {
    if (!supabase) return;
    setBusy(true);
    setRouteError(null);

    try {
      const stack = stackCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const finalImageUrl = await uploadIfNeeded();

      const payload: any = {
        title,
        subtitle,
        desc,
        details: details || null,
        stack,
        live_url: liveUrl,
        github_url: githubUrl || null,
        image_url: finalImageUrl,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      };

      if (editingId === null) {
        const { error } = await supabase.from('projects').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
      }

      await loadProjects();
      resetForm();
    } catch (e: any) {
      setRouteError(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const edit = (p: ProjectData) => {
    setEditingId(p.id);
    setTitle(p.title ?? '');
    setSubtitle(p.subtitle ?? '');
    setDesc(p.desc ?? '');
    setDetails((p.details ?? '') as string);
    setStackCsv((p.stack ?? []).join(', '));
    setLiveUrl(p.liveUrl ?? '');
    setGithubUrl((p.githubUrl ?? '') as string);
    setSortOrder((p.sortOrder ?? 0) as number);
    setImageFile(null);
    setImageUrl((p.imageUrl ?? '') as string);
  };

  const remove = async (id: number) => {
    if (!supabase) return;
    const ok = window.confirm('حذف المشروع؟');
    if (!ok) return;
    setBusy(true);
    setRouteError(null);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await loadProjects();
      if (editingId === id) resetForm();
    } catch (e: any) {
      setRouteError(e?.message ?? 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const goHome = () => {
    window.location.hash = '#/';
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="absolute inset-0 overflow-auto bg-black text-white p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Admin</h1>
            <button onClick={goHome} className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors">رجوع</button>
          </div>
          <div className="text-white/70">{routeError}</div>
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="absolute inset-0 overflow-auto bg-black text-white p-10" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="text-white/70">جاري تحميل لوحة التحكم...</div>
        </div>
      </div>
    );
  }

  const cardClass = "rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]";
  const inputClass = "w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20";
  const textareaClass = "w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20";
  const btnGhost = "rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors";
  const btnDanger = "rounded-xl px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50";
  const btnPrimary = "rounded-xl px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors disabled:opacity-50";
  const btnSolid = "w-full rounded-xl bg-white text-black px-4 py-3 font-black disabled:opacity-50";

  return (
    <div className="absolute inset-0 overflow-auto bg-gradient-to-b from-black via-black to-slate-950 text-white" dir="rtl">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">لوحة التحكم</h1>
            <div className="text-white/60 text-sm mt-1">{sessionEmail ? `مسجل دخول: ${sessionEmail}` : 'سجّل دخول لإدارة المشاريع'}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={goHome} className={btnGhost}>الموقع</button>
            {sessionEmail && (
              <>
                <button disabled={busy} onClick={seedDefaults} className={btnPrimary}>إضافة المشاريع الحالية</button>
                <button disabled={busy} onClick={deleteAllProjects} className={btnDanger}>مسح الكل</button>
                <button disabled={authBusy} onClick={signOut} className="rounded-xl px-4 py-2 bg-red-500/80 hover:bg-red-500 transition-colors disabled:opacity-50">تسجيل خروج</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {routeError && <div className="mb-6 text-red-200 bg-red-950/40 border border-red-800/40 rounded-2xl p-4">{routeError}</div>}

        {!sessionEmail ? (
          <div className={`${cardClass} max-w-lg p-6`}>
            <div className="text-2xl font-black mb-1">تسجيل دخول</div>
            <div className="text-white/60 text-sm mb-5">استخدم حساب الأدمن في Supabase Auth</div>
            <div className="space-y-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Email" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={inputClass} placeholder="Password" />
              <button disabled={authBusy || !email || !password} onClick={signIn} className={btnSolid}>دخول</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-black">{editingId ? `تعديل مشروع #${editingId}` : 'إضافة مشروع'}</div>
                <button onClick={resetForm} className={btnGhost}>تفريغ</button>
              </div>

              <div className="space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="اسم المشروع" />
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="الكلام اللي تحت الاسم" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className={`${textareaClass} min-h-[96px]`} placeholder="وصف مختصر" />
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} className={`${textareaClass} min-h-[140px]`} placeholder="تفاصيل المشروع" />
                <input value={stackCsv} onChange={(e) => setStackCsv(e.target.value)} className={inputClass} placeholder="التقنيات (افصل بفاصلة , )" />
                <input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className={inputClass} placeholder="رابط المشروع" />
                <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} placeholder="GitHub (اختياري)" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value || 0))} type="number" className={inputClass} placeholder="ترتيب العرض" />
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="رابط صورة (اختياري)" />
                </div>

                <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                  <div className="text-sm text-white/70 mb-2">رفع صورة (Supabase Storage)</div>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="w-full" />
                </div>

                <button disabled={busy || !title || !liveUrl} onClick={upsertProject} className={btnSolid}>
                  {editingId ? 'حفظ التعديل' : 'إضافة'}
                </button>
              </div>
            </div>

            <div className={`${cardClass} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-black">المشاريع</div>
                <button disabled={busy} onClick={loadProjects} className={`${btnGhost} disabled:opacity-50`}>تحديث</button>
              </div>

              <div className="space-y-3">
                {items.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-black text-lg">{p.title}</div>
                        <div className="text-white/60 text-sm mt-1">{p.subtitle}</div>
                        <div className="text-white/40 text-xs mt-2">ID: {p.id} | Order: {p.sortOrder ?? 0}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => edit(p)} className={btnGhost}>تعديل</button>
                        <button onClick={() => remove(p.id)} className="rounded-xl px-4 py-2 bg-red-500/70 hover:bg-red-500 transition-colors">حذف</button>
                      </div>
                    </div>

                    {(p.imageUrl || p.liveUrl) && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.title} className="w-full h-32 object-cover border border-white/10" />
                        )}
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors text-center">فتح الرابط</a>
                      </div>
                    )}
                  </div>
                ))}

                {items.length === 0 && !busy && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                    <div className="font-black text-lg">لا يوجد مشاريع بعد</div>
                    <div className="text-white/60 text-sm mt-1">اضغط لإضافة المشاريع الحالية إلى قاعدة البيانات ثم عدّل/احذف كما تريد.</div>
                    <button disabled={busy} onClick={seedDefaults} className={`${btnPrimary} mt-4`}>إضافة المشاريع الحالية</button>
                  </div>
                )}

                {busy && <div className="text-white/60">جاري التنفيذ...</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
