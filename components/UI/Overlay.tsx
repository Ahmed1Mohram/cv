import React from 'react';
import { useStore, SECTIONS } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.11 17.53c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.13-.17.25-.65.81-.8.97-.15.17-.29.19-.55.06-.25-.13-1.07-.39-2.04-1.25-.75-.67-1.25-1.49-1.4-1.75-.15-.25-.02-.39.11-.52.12-.12.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.87-.21-.5-.42-.43-.57-.44l-.49-.01c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.17 1.78 2.71 4.32 3.8.6.26 1.07.41 1.44.52.6.19 1.14.16 1.57.1.48-.07 1.48-.6 1.69-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
    <path d="M26.67 5.33C23.82 2.48 20.03.91 16 .91 7.86.91 1.25 7.52 1.25 15.66c0 2.6.68 5.14 1.97 7.39L1.12 30.91l8.07-2.12c2.19 1.2 4.67 1.83 6.81 1.83h.01c8.14 0 14.75-6.61 14.75-14.75 0-4.03-1.57-7.82-4.42-10.54zM16 28.15h-.01c-2 0-4.48-.76-6.35-1.93l-.46-.27-4.79 1.26 1.28-4.66-.3-.48c-1.2-1.91-1.84-4.11-1.84-6.35 0-6.77 5.51-12.28 12.3-12.28 3.28 0 6.36 1.28 8.68 3.6 2.32 2.32 3.6 5.4 3.6 8.68 0 6.77-5.51 12.43-12.1 12.43z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.62.76-1.62 1.54V12h2.76l-.44 2.88h-2.32v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

export const Overlay: React.FC = () => {
  const currentSection = useStore(state => state.currentSection);
  const expandedProject = useStore(state => state.expandedProject);
  const setExpandedProject = useStore(state => state.setExpandedProject);
  const projectsFromStore = useStore(state => state.projects);

  const spaceIconButtonClass = "group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white/5 backdrop-blur-md border border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_26px_90px_rgba(0,0,0,0.65)] flex items-center justify-center transition-all duration-300 ease-out hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_0_1px_rgba(147,197,253,0.32),0_0_40px_rgba(147,197,253,0.22),0_34px_110px_rgba(0,0,0,0.72)] hover:scale-[1.08] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70";
  const spaceIconClass = "w-6 h-6 sm:w-7 sm:h-7 text-white/95 drop-shadow-[0_0_14px_rgba(147,197,253,0.24)] transition-transform duration-300 ease-out group-hover:scale-110";
  const spaceNumberClass = "text-xs sm:text-sm font-semibold text-white/80 px-3 sm:px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.55)] tracking-wider";

  const whatsappNumber = '01005209667';
  const whatsappUrl = 'https://wa.me/201005209667';
  const facebookUrl = 'https://www.facebook.com/ahmd.mhrm.456292';

  const fallbackProjectsInfo: Record<number, { title: string; desc: string; details?: string | null; stack: string[]; liveUrl: string; githubUrl?: string | null }> = {
      1: { title: "موقع د. أحمد محرم", desc: "موقع تعريفي احترافي يبرز الهوية والخدمات مع تجربة مستخدم واضحة وسريعة.", stack: ["واجهة", "أداء", "تجربة مستخدم"], liveUrl: "https://dr-ahmed-mohram.vercel.app/" },
      2: { title: "بورتفوليو محمد محرم", desc: "بورتفوليو تفاعلي بتصميم عصري وانتقالات ناعمة وتركيز على السلاسة.", stack: ["UI", "Motion", "Responsive"], liveUrl: "https://mohamed-mohram.vercel.app/" },
      3: { title: "مشروع تجريبي", desc: "مساحة لتجارب الواجهات والتفاعلات قبل نقلها لمشاريع الإنتاج.", stack: ["Prototype", "UI", "Iteration"], liveUrl: "https://fgdfg-livid.vercel.app/" },
      4: { title: "المستقبل", desc: "موقع محتوى/خدمات مع تنظيم أقسام واضح وتجربة قراءة مريحة.", stack: ["Content", "UX", "Performance"], liveUrl: "https://www.almostaqbal.net/" },
      5: { title: "أذكار", desc: "تجربة خفيفة وسريعة لعرض الأذكار بتصميم بسيط وعملي.", stack: ["Simple", "Fast", "Mobile"], liveUrl: "https://azqar.vercel.app/" },
      6: { title: "Mohram AI", desc: "واجهة نظيفة لتجربة ذكاء اصطناعي مع تركيز على السرعة والوضوح.", stack: ["AI", "UI", "Speed"], liveUrl: "https://mohram-ai.vercel.app/" },
      7: { title: "كوتش نصر", desc: "صفحة هبوط لعرض الخدمة وبناء الثقة مع دعوة واضحة لاتخاذ إجراء.", stack: ["Landing", "Conversion", "Brand"], liveUrl: "https://cotch-nasr.vercel.app/" }
  };

  const projectsInfo: Record<number, { title: string; desc: string; details?: string | null; stack: string[]; liveUrl: string; githubUrl?: string | null }> = React.useMemo(() => {
    if (projectsFromStore && projectsFromStore.length > 0) {
      const r: Record<number, { title: string; desc: string; details?: string | null; stack: string[]; liveUrl: string; githubUrl?: string | null }> = {};
      for (const p of projectsFromStore) {
        r[p.id] = {
          title: p.title,
          desc: p.desc,
          details: p.details ?? null,
          stack: Array.isArray(p.stack) ? p.stack : [],
          liveUrl: p.liveUrl,
          githubUrl: p.githubUrl ?? null,
        };
      }
      return r;
    }
    return fallbackProjectsInfo;
  }, [projectsFromStore]);

  const activeInfo = expandedProject ? projectsInfo[expandedProject as keyof typeof projectsInfo] : null;

  return (
    <>
    <main className={`absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-8 lg:p-12 text-white transition-opacity duration-500 ${expandedProject !== null ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <header className="flex justify-between items-center w-full">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tighter">معرض أعمال</h1>
        <div className="hidden sm:block text-xs uppercase tracking-widest opacity-50">
           اسحب للاكتشاف
        </div>
      </header>

      {/* Dynamic Section Content */}
      <div className="flex-grow flex items-center justify-center relative w-full h-full">
        <AnimatePresence mode="wait">
            {currentSection === SECTIONS.INTRO && (
                <motion.div 
                    key="intro"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                    dir="rtl"
                >
                    <h2 className="text-4xl sm:text-6xl lg:text-8xl leading-tight font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        مرحبا بك ف عالم<br />
                        أحمد محرم
                    </h2>
                    <div className="mt-5 text-lg sm:text-xl font-light text-white/70">
                        ببني تجارب رقمية غامرة
                    </div>
                </motion.div>
            )}

            {currentSection === SECTIONS.PROJECTS && (
                <motion.div 
                    key="projects"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 max-w-[92vw] text-right pointer-events-auto"
                    dir="rtl"
                >
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">أعمال مختارة</h2>
                    <p className="max-w-xs sm:max-w-md text-xs sm:text-sm opacity-70 mb-4">
                        مجموعة من التجارب التقنية. <br/>
                        <span className="text-blue-400">اضغط على أي مشروع لعرض التفاصيل.</span>
                    </p>
                </motion.div>
            )}

            {currentSection === SECTIONS.CONTACT && (
                <motion.div
                    key="contact"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto"
                    dir="rtl"
                >
                    <div className="flex items-center gap-4 justify-center">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={spaceIconButtonClass}
                            aria-label="WhatsApp"
                            title={whatsappNumber}
                        >
                            <span className="pointer-events-none absolute -inset-[2px] rounded-full opacity-70 blur-[0.5px] transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(125,211,252,0.22), transparent 62%), radial-gradient(circle at 35% 30%, rgba(167,139,250,0.14), transparent 60%)' }} />
                            <span className="pointer-events-none absolute inset-0 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(125,211,252,0.16), transparent 55%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.12), transparent 60%)' }} />
                            <WhatsAppIcon className={spaceIconClass} />
                        </a>
                        <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={spaceIconButtonClass}
                            aria-label="Facebook"
                            title="Facebook"
                        >
                            <span className="pointer-events-none absolute -inset-[2px] rounded-full opacity-70 blur-[0.5px] transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(125,211,252,0.22), transparent 62%), radial-gradient(circle at 35% 30%, rgba(167,139,250,0.14), transparent 60%)' }} />
                            <span className="pointer-events-none absolute inset-0 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(125,211,252,0.16), transparent 55%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.12), transparent 60%)' }} />
                            <FacebookIcon className={spaceIconClass} />
                        </a>
                        <div className={`${spaceNumberClass} relative overflow-hidden`}>
                            <span className="pointer-events-none absolute inset-0 opacity-70" style={{ background: 'linear-gradient(90deg, rgba(125,211,252,0.10), transparent 40%, rgba(167,139,250,0.10))' }} />
                            {whatsappNumber}
                        </div>
                    </div>
                </motion.div>
            )}
            
        </AnimatePresence>

        {currentSection === SECTIONS.INTRO && expandedProject === null && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: [0.55, 0.95, 0.55], y: [0, 8, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <div className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white/5 backdrop-blur-md border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_70px_rgba(0,0,0,0.65)] flex items-center justify-center">
              <span
                className="pointer-events-none absolute -inset-[2px] rounded-full opacity-70 blur-[0.5px]"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(125,211,252,0.18), transparent 62%), radial-gradient(circle at 35% 30%, rgba(167,139,250,0.14), transparent 60%)' }}
              />
              <span
                className="pointer-events-none absolute inset-0 rounded-full opacity-60"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(125,211,252,0.12), transparent 55%), radial-gradient(circle at 70% 80%, rgba(167,139,250,0.1), transparent 60%)' }}
              />
              <svg viewBox="0 0 24 24" fill="none" className="relative w-6 h-6 sm:w-7 sm:h-7 text-white/90 drop-shadow-[0_0_16px_rgba(147,197,253,0.25)]">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer / Progress */}
      <footer className="w-full flex justify-between items-end">
         <div className="flex flex-wrap gap-2 sm:gap-4">
             {['مقدمة', 'المشاريع', 'المهارات', 'نبذة', 'تواصل'].map((item, idx) => (
                 <div key={item} className={`text-[10px] sm:text-xs uppercase transition-colors duration-300 ${currentSection === idx ? 'text-white font-bold' : 'text-gray-600'}`}>
                     0{idx+1} {item}
                 </div>
             ))}
         </div>
      </footer>
    </main>

    {/* PROJECT DETAIL OVERLAY */}
    <AnimatePresence>
        {expandedProject !== null && activeInfo && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }} // Delay to let 3D animation finish
                className="absolute top-0 left-0 w-full h-full z-20 flex bg-black/25 pointer-events-auto overflow-y-auto sm:overflow-hidden"
            >
                {/* Content Container */}
                <div className="container mx-auto flex min-h-full flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-12">
                    
                    {/* Left Side: Info */}
                    <div className="w-full sm:w-1/2 flex flex-col items-end space-y-6 sm:space-y-8 pr-0 sm:pr-12 text-right bg-black/30 p-4 sm:p-8 mt-16 sm:mt-0" dir="rtl">
                         <motion.h2 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-3xl sm:text-5xl lg:text-7xl font-black text-white"
                         >
                            {activeInfo.title}
                         </motion.h2>

                         <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                         >
                             <div className="flex flex-wrap gap-4 mb-6 justify-end">
                                {activeInfo.stack.map(tech => (
                                    <span key={tech} className="px-3 py-1 border border-white/20 rounded-full text-xs uppercase tracking-wider">
                                        {tech}
                                    </span>
                                ))}
                             </div>
                             <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-lg leading-relaxed">
                                {activeInfo.desc}
                             </p>
                             {activeInfo.details && (
                               <p className="mt-4 text-gray-300 max-w-lg leading-relaxed">
                                  {activeInfo.details}
                               </p>
                             )}
                             <p className="mt-4 text-gray-400 text-sm max-w-lg">
                                لو تحب نسخة مشابهة لمشروعك مع تصميم مخصص وأداء عالي على الموبايل والكمبيوتر، ابعتلي تفاصيل فكرتك.
                             </p>
                         </motion.div>

                         <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                         >
                            <div className="flex gap-4 justify-end">
                                <button
                                  onClick={() => activeInfo?.liveUrl && window.open(activeInfo.liveUrl, '_blank', 'noopener,noreferrer')}
                                  className="bg-white text-black px-5 sm:px-8 py-2.5 sm:py-3 font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors rounded-none"
                                >
                                    عرض مباشر
                                </button>
                                {activeInfo?.githubUrl && (
                                  <button
                                    onClick={() => window.open(activeInfo.githubUrl, '_blank', 'noopener,noreferrer')}
                                    className="border border-white text-white px-5 sm:px-8 py-2.5 sm:py-3 font-bold text-base sm:text-lg hover:bg-white/10 transition-colors rounded-none"
                                  >
                                      جيتهاب
                                  </button>
                                )}
                            </div>
                         </motion.div>
                    </div>

                    {/* Right Side: Close Button */}
                    <div className="absolute top-4 sm:top-12 right-4 sm:right-12">
                        <button 
                            onClick={() => setExpandedProject(null)}
                            className="text-white hover:text-red-500 transition-colors text-sm sm:text-xl font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            <span>إغلاق</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};