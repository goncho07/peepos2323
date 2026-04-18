import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  CalendarDays, 
  X,
  Mail,
  GraduationCap,
  Check,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { PageHeader, containerVariants } from '../components/UI';
import { ModuleProps } from '../types';

// Mock data integration
const MOCK_STUDENTS = [
  { id: '1', name: 'Laura Gómez', grade: '3° Grado', section: 'A', level: 'Primaria' },
  { id: '2', name: 'Carlos Díaz', grade: '5° Grado', section: 'B', level: 'Secundaria' },
  { id: '3', name: 'Mía Torres', grade: '1° Grado', section: 'A', level: 'Primaria' },
  { id: '4', name: 'Jorge Silva', grade: '4° Grado', section: 'B', level: 'Secundaria' },
  { id: '5', name: 'Ana Rojas', grade: '2° Grado', section: 'A', level: 'Primaria' },
];

export const CitationsModule: React.FC<ModuleProps> = () => {
  const [activeTab, setActiveTab] = useState<'Pendiente' | 'Proceso' | 'Confirmada'>('Pendiente');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [citations, setCitations] = useState([
    {
      id: 1,
      studentId: '1',
      studentName: 'Laura Gómez',
      gradeInfo: 'Primaria - 3° A',
      reason: 'Acumulación de 3 incidencias leves',
      type: 'Leve',
      category: 'Incidencias',
      date: '18/04/2026',
      status: 'Pendiente',
      incidentHistory: [
        { date: '10/04/2026', time: '08:15', reportedBy: 'Ana Rojas', description: 'Uso de joyas', type: 'Leve' },
        { date: '12/04/2026', time: '10:00', reportedBy: 'Ana Rojas', description: 'Uñas pintadas', type: 'Leve' },
        { date: '15/04/2026', time: '12:20', reportedBy: 'Ana Rojas', description: 'Uniforme incompleto', type: 'Leve' },
      ],
      tutor: 'Tutor Principal',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 2,
      studentId: '2',
      studentName: 'Carlos Díaz',
      gradeInfo: 'Secundaria - 5° B',
      reason: 'Bajo rendimiento académico en Matemáticas',
      type: 'Académica',
      category: 'Académico',
      course: 'Matemáticas',
      date: '17/04/2026',
      status: 'Pendiente',
      incidentHistory: [
        { date: '12/04/2026', time: '09:30', reportedBy: 'Tutor', description: 'Nota desaprobatoria (08/20) en examen parcial', type: 'Académica' },
      ],
      tutor: 'Tutor Secundaria',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 3,
      studentId: '4',
      studentName: 'Jorge Silva',
      gradeInfo: 'Secundaria - 4° B',
      reason: '1 Incidencia Grave reportada',
      type: 'Grave',
      category: 'Incidencias',
      date: '16/04/2026',
      status: 'Confirmada',
      incidentHistory: [
        { date: '16/04/2026', time: '14:30', reportedBy: 'Rosa Paredes', description: 'Agresión física a compañero', type: 'Grave' },
      ],
      tutor: 'Tutor Secundaria',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      scheduledDate: '20/04/2026',
      scheduledTime: '10:00 AM'
    }
  ]);

  const filteredCitations = citations
    .filter(c => c.status === activeTab)
    .filter(c => c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || c.reason.toLowerCase().includes(searchQuery.toLowerCase()));

  const [composeCategory, setComposeCategory] = useState<'Académico' | 'Incidencias'>('Académico');
  const [composeData, setComposeData] = useState({
    studentId: '',
    reason: '',
    severity: 'Leve',
    course: ''
  });

  const handleCreateNew = () => {
    if (!composeData.studentId) return;
    const student = MOCK_STUDENTS.find(s => s.id === composeData.studentId);
    if (!student) return;

    const newCit = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      gradeInfo: `${student.level} - ${student.grade.replace('° Grado', '°')} ${student.section}`,
      reason: composeData.reason,
      type: composeCategory === 'Académico' ? 'Académica' : composeData.severity,
      category: composeCategory,
      course: composeData.course,
      date: new Date().toLocaleDateString('es-PE'),
      status: 'Pendiente',
      incidentHistory: [
        {
          date: new Date().toLocaleDateString('es-PE'),
          time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          reportedBy: 'Docente Actual',
          description: composeData.reason,
          type: composeCategory === 'Académico' ? 'Académica' : composeData.severity
        }
      ],
      tutor: 'Tutor',
      createdAt: new Date().toISOString()
    };

    setCitations([newCit, ...citations]);
    setIsComposeOpen(false);
    setComposeData({ studentId: '', reason: '', severity: 'Leve', course: '' });
  };

  const getSeverityStyle = (type: string) => {
    switch (type) {
      case 'Grave': return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', bullet: 'bg-rose-500' };
      case 'Moderada': return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', bullet: 'bg-orange-500' };
      case 'Leve': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', bullet: 'bg-amber-500' };
      case 'Académica': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', bullet: 'bg-blue-500' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', bullet: 'bg-slate-500' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (isToday) return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-4 md:p-8 h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950 min-h-0">
      <PageHeader title="Gestión de Citaciones" subtitle="Administra las reuniones y citaciones de apoderados de forma estructurada" icon={CalendarDays} />
      
      <div className="flex-1 flex flex-col xl:flex-row gap-8 mt-6 min-h-0 overflow-hidden">
        
        {/* SIDEBAR & LIST PANEL */}
        <div className="flex flex-col w-full xl:w-[450px] shrink-0 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800 flex-1 min-h-0 overflow-hidden relative">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 z-10 shrink-0">
            <button 
              onClick={() => setIsComposeOpen(true)}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 mb-6"
            >
              <Plus size={20} strokeWidth={2.5} />
              Generar Citación
            </button>

            {/* Custom Tabs */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-[18px]">
               <button 
                 onClick={() => { setActiveTab('Pendiente'); setSelectedCitation(null); }}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'Pendiente' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <AlertTriangle size={16} className={activeTab === 'Pendiente' ? 'text-rose-500' : 'text-slate-400'}/>
                 Pendientes
               </button>
               <button 
                 onClick={() => { setActiveTab('Proceso'); setSelectedCitation(null); }}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'Proceso' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Clock size={16} className={activeTab === 'Proceso' ? 'text-amber-500' : 'text-slate-400'}/>
                 En Proceso
               </button>
               <button 
                 onClick={() => { setActiveTab('Confirmada'); setSelectedCitation(null); }}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'Confirmada' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <CheckCircle2 size={16} className={activeTab === 'Confirmada' ? 'text-emerald-500' : 'text-slate-400'}/>
                 Historial
               </button>
            </div>
            
            <div className="mt-5 relative">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Buscar estudiante..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all"
               />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full p-3 space-y-2">
            {filteredCitations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                    <CheckCircle2 size={32} className="text-slate-300 dark:text-slate-600" />
                 </div>
                 <h4 className="text-slate-900 dark:text-white font-bold mb-1">Bandeja Vacía</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">No hay citaciones en esta pestaña.</p>
              </div>
            ) : (
              filteredCitations.map(cit => {
                const isSelected = selectedCitation?.id === cit.id;
                const style = getSeverityStyle(cit.type);
                return (
                  <div 
                    key={cit.id}
                    onClick={() => setSelectedCitation(cit)}
                    className={`group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-blue-50/80 dark:bg-slate-800 ring-1 ring-blue-200 dark:ring-slate-700 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold shadow-sm border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                      {cit.studentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-[15px] font-bold truncate pr-2 ${isSelected ? 'text-blue-900 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                          {cit.studentName}
                        </h4>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{formatDate(cit.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border ${style.bg} ${style.text} ${style.border}`}>
                          {cit.category === 'Académico' ? 'Académico' : cit.type}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 truncate">{cit.gradeInfo}</span>
                      </div>
                      <p className={`text-xs truncate font-medium ${isSelected ? 'text-blue-800/70 dark:text-blue-200/70' : 'text-slate-500 dark:text-slate-400'}`}>
                        {cit.reason}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* READING PANE */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden h-full relative">
          {selectedCitation ? (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
               <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Expediente de Citación</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5"><CalendarDays size={16} /> Emitido el {formatDate(selectedCitation.createdAt)}</div>
                      <div className="flex items-center gap-1.5"><User size={16} /> Tutor: {selectedCitation.tutor}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${getSeverityStyle(selectedCitation.type).bg} ${getSeverityStyle(selectedCitation.type).text} ${getSeverityStyle(selectedCitation.type).border}`}>
                        {selectedCitation.type}
                     </span>
                     <button onClick={() => setSelectedCitation(null)} className="xl:hidden p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 pb-24">
                  {/* Student Minimal Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800/60 flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/20 shrink-0">
                      {selectedCitation.studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedCitation.studentName}</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                         <GraduationCap size={16} />
                         {selectedCitation.gradeInfo}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Reason Block */}
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider ml-1">Observación Principal</h4>
                      <div className={`p-6 rounded-[24px] border ${getSeverityStyle(selectedCitation.type).bg} ${getSeverityStyle(selectedCitation.type).border}`}>
                        <div className="flex gap-4">
                           <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/50 ${getSeverityStyle(selectedCitation.type).text} shadow-sm`}>
                             {selectedCitation.category === 'Académico' ? <BookOpen size={16} /> : <AlertTriangle size={16} />}
                           </div>
                           <div>
                             <p className={`text-base font-bold ${getSeverityStyle(selectedCitation.type).text} leading-relaxed`}>
                               {selectedCitation.reason}
                             </p>
                             {selectedCitation.course && (
                               <div className="mt-3 inline-flex px-3 py-1 bg-white/60 dark:bg-slate-900/40 rounded-lg border border-white/20 dark:border-white/5 text-sm font-bold shadow-sm">
                                  Curso: {selectedCitation.course}
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-5 uppercase tracking-wider ml-1">Historial del Estudiante</h4>
                      <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-6 ml-2 pb-4">
                        {selectedCitation.incidentHistory.map((inc: any, idx: number) => (
                          <div key={idx} className="relative pl-6">
                            <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${getSeverityStyle(inc.type).bullet} shadow-sm`} />
                            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">{inc.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md"><CalendarDays size={14}/> {inc.date} • {inc.time}</span>
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md"><User size={14}/> {inc.reportedBy}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 z-20">
                  {selectedCitation.status === 'Pendiente' ? (
                     <button className="w-full xl:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[16px] font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                       <CalendarDays size={18} strokeWidth={2.5}/>
                       Agendar y Notificar
                     </button>
                  ) : selectedCitation.status === 'Proceso' ? (
                     <button className="w-full xl:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[16px] font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                       <CheckCircle2 size={18} strokeWidth={2.5}/>
                       Marcar como Realizada
                     </button>
                  ) : (
                     <button className="w-full xl:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-[16px] transition-colors flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                       <Mail size={18} />
                       Reenviar Resumen
                     </button>
                  )}
                </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500">
              <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner pointer-events-none">
                <Inbox size={48} className="text-slate-300 dark:text-slate-600/50 stroke-[1.5]" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-3 tracking-tight">Expediente de Citación</h3>
              <p className="max-w-sm font-medium leading-relaxed">
                Selecciona una citación de la lista lateral para revisar el historial del estudiante y tomar acción.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL REDACTAR */}
      <AnimatePresence>
        {isComposeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-200/50 dark:border-slate-700"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                   <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-inner">
                      <Plus size={24} strokeWidth={2.5}/>
                   </div>
                   Generar Citación
                </h3>
                <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30 custom-scrollbar">
                
                {/* Tabs Type */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[20px] mb-8 shadow-inner">
                  {(['Académico', 'Incidencias'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setComposeCategory(tab)}
                      className={`flex-1 py-3 font-bold text-sm rounded-[16px] transition-all flex items-center justify-center gap-2 ${composeCategory === tab ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100'}`}
                    >
                      {tab === 'Académico' ? <GraduationCap size={18} strokeWidth={2.5}/> : <AlertTriangle size={18} strokeWidth={2.5}/>}
                      Tema {tab}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-slate-800 dark:text-slate-200 ml-1">Estudiante</label>
                    <div className="relative">
                       <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <select 
                         value={composeData.studentId}
                         onChange={(e) => setComposeData({...composeData, studentId: e.target.value})}
                         className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-10 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all appearance-none tracking-wide cursor-pointer"
                       >
                         <option value="" disabled>Seleccione un estudiante...</option>
                         {MOCK_STUDENTS.map(s => (
                           <option key={s.id} value={s.id}>{s.name} - {s.grade} {s.section}</option>
                         ))}
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                         <ChevronRight size={18} className="text-slate-400" />
                       </div>
                    </div>
                  </div>

                  {composeCategory === 'Académico' ? (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="block text-sm font-black text-slate-800 dark:text-slate-200 ml-1">Curso Afectado</label>
                      <div className="relative">
                         <BookOpen size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                           type="text" 
                           placeholder="Ej. Matemáticas, Comunicación..."
                           value={composeData.course}
                           onChange={(e) => setComposeData({...composeData, course: e.target.value})}
                           className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-medium"
                         />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="block text-sm font-black text-slate-800 dark:text-slate-200 ml-1">Nivel de Gravedad</label>
                      <div className="relative">
                         <AlertTriangle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <select 
                           value={composeData.severity}
                           onChange={(e) => setComposeData({...composeData, severity: e.target.value})}
                           className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-10 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all appearance-none cursor-pointer"
                         >
                           <option value="Leve">⚠️ Leve (Prevención / Llamado de atención)</option>
                           <option value="Moderada">🟠 Moderada (Reiterativo)</option>
                           <option value="Grave">🔴 Grave (Cita Directa Inmediata)</option>
                         </select>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                           <ChevronRight size={18} className="text-slate-400" />
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pb-4">
                    <label className="block text-sm font-black text-slate-800 dark:text-slate-200 ml-1">Observación Detallada</label>
                    <textarea 
                      rows={4}
                      placeholder={composeCategory === 'Académico' ? "Especifique las notas desaprobatorias, falta de tareas, etc..." : "Especifique el comportamiento o incidente ocurrido..."}
                      value={composeData.reason}
                      onChange={(e) => setComposeData({...composeData, reason: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all resize-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="px-6 py-3 rounded-[16px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateNew}
                  disabled={!composeData.studentId || !composeData.reason || (composeCategory === 'Académico' && !composeData.course)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[16px] font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Check size={20} strokeWidth={2.5}/>
                  Guardar Citación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
