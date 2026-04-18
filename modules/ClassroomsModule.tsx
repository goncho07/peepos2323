import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  Users, 
  PieChart as PieChartIcon, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  School,
  XCircle,
  Clock,
  Download,
  LayoutGrid,
  ShieldCheck,
  X,
  Check,
  Info,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldAlert,
  Palette,
  BookOpen,
  FileText,
  FileDown,
  CalendarDays,
  CalendarRange,
  Layers,
  Folder,
  Eye,
  GraduationCap,
  ExternalLink,
  MessageCircle,
  Bell,
  ArrowLeft,
  UserCheck,
  MonitorPlay,
  Mail
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { EDUCATIONAL_STRUCTURE, MOCK_USERS, INCIDENT_TYPES } from '../constants';
import { UserItem } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PageHeader, containerVariants } from '../components/UI';
import { CustomCalendar, getDateFromWeekString, getWeekString } from '../src/components/CustomCalendar';
import { ReportHistoryItem, getFolderStyle, ReportPreviewModal } from '../components/ReportShared';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

const MONTHS = [
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Mayo' },
  { value: 5, label: 'Junio' },
  { value: 6, label: 'Julio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Septiembre' },
  { value: 9, label: 'Octubre' },
  { value: 10, label: 'Noviembre' },
  { value: 11, label: 'Diciembre' }
];

import { ModuleProps } from '../types';

const getAuxiliarForClassroom = (level: string, grade: string, section: string) => {
  if (level === 'Secundaria') {
    if (grade === '1° Grado' || grade === '2° Grado') {
      return grade === '1° Grado' ? 'Carlos Mendoza' : 'Ana Rojas';
    } else if (grade === '3° Grado' || grade === '4° Grado') {
      return grade === '3° Grado' ? 'Luis Ramirez' : 'Carmen Vega';
    } else if (grade === '5° Grado') {
      return ['A', 'B'].includes(section) ? 'Jorge Silva' : 'Rosa Paredes';
    }
  } else if (level === 'Primaria') {
    return 'María Fernandez';
  }
  return 'Juana Perez';
};

export const ClassroomsModule: React.FC<ModuleProps> = ({ onNavigate, onRegisterIncident, parentViewStudentId }) => {
  const [selectedClassroom, setSelectedClassroom] = useState<{ level: string, grade: string, section: string } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserItem | null>(() => {
    if (parentViewStudentId) {
      return MOCK_USERS.find(u => u.id === parentViewStudentId) || null;
    }
    return null;
  });
  const [showHistoryDirectly, setShowHistoryDirectly] = useState(false);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full flex flex-col font-poppins">
      {!parentViewStudentId && (
        <PageHeader 
          title="Aulas" 
          subtitle="Seleccione un aula para ver sus detalles y estudiantes" 
          icon={LayoutGrid} 
        />
      )}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {selectedStudent ? (
          <StudentDetail student={selectedStudent} onBack={() => {
            if (!parentViewStudentId) {
              setSelectedStudent(null);
            }
          }} isParentView={!!parentViewStudentId} />
        ) : selectedClassroom ? (
          <ClassroomDetail 
            classroom={selectedClassroom} 
            onBack={() => {
              setSelectedClassroom(null);
              setShowHistoryDirectly(false);
            }} 
            onSelectStudent={setSelectedStudent} 
            initialShowHistory={showHistoryDirectly}
          />
        ) : (
          <ClassroomList 
            onSelectClassroom={(c) => {
              setSelectedClassroom(c);
              setShowHistoryDirectly(false);
            }} 
            onSelectClassroomHistory={(c) => {
              setSelectedClassroom(c);
              setShowHistoryDirectly(true);
            }}
            onRegisterIncident={onRegisterIncident} 
          />
        )}
      </div>
    </motion.div>
  );
};

const ClassroomList: React.FC<{ 
  onSelectClassroom: (c: { level: string, grade: string, section: string }) => void;
  onSelectClassroomHistory: (c: { level: string, grade: string, section: string }) => void;
  onRegisterIncident?: () => void;
}> = ({ onSelectClassroom, onSelectClassroomHistory, onRegisterIncident }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedGrade, setSelectedGrade] = useState<string>('Todos');
  const [isDesglosado, setIsDesglosado] = useState(false);

  const getMockClassroomKPIs = (level: string, grade: string, section: string) => {
    const hash = (level + grade + section).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const attendance = 85 + (hash % 16); // 85% to 100%
    const alerts = hash % 4; // 0 to 3
    const capacity = 30;
    return { attendance, alerts, capacity };
  };

  const getFluentClassroomIcon = (section: string) => {
    const hash = section.charCodeAt(0) % 5;
    const icons = ['blue-book.svg', 'green-book.svg', 'orange-book.svg', 'closed-book.svg', 'open-book.svg'];
    return icons[hash];
  };

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
      {/* CONTENIDO PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/50">
            {selectedLevel === 'Todos' ? (
              <div className="animate-in fade-in duration-300">
                <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-8 border border-b-0 border-gray-200 dark:border-slate-700">
                  <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Selecciona tu nivel educativo
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-base font-medium mt-2">
                    Explora las estadísticas y gestiona las secciones por nivel
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-b-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                    {Object.keys(EDUCATIONAL_STRUCTURE).map((level, index) => {
                      const gradeCount = Object.keys(EDUCATIONAL_STRUCTURE[level as keyof typeof EDUCATIONAL_STRUCTURE]).length;
                      const sectionCount = Object.values(EDUCATIONAL_STRUCTURE[level as keyof typeof EDUCATIONAL_STRUCTURE]).reduce((acc, sections) => acc + sections.length, 0);
                      
                      const studentsCount = level === 'Inicial' ? 280 : level === 'Primaria' ? 532 : 952;
                      const teachersCount = level === 'Inicial' ? 36 : level === 'Primaria' ? 38 : 43;

                      const style = level === 'Inicial' 
                        ? { 
                            bg: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/40 dark:to-teal-900/20', 
                            border: 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-500/80',
                            badgeTheme: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', 
                            icon: 'artist-palette.svg',
                            shadow: 'hover:shadow-emerald-500/20'
                          }
                        : level === 'Primaria'
                        ? { 
                            bg: 'from-blue-500/10 to-indigo-500/5 dark:from-blue-900/40 dark:to-indigo-900/20', 
                            border: 'border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-500/80', 
                            badgeTheme: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', 
                            icon: 'open-book.svg',
                            shadow: 'hover:shadow-blue-500/20'
                          }
                        : { 
                            bg: 'from-orange-500/10 to-amber-500/5 dark:from-orange-900/40 dark:to-amber-900/20', 
                            border: 'border-orange-200 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-500/80', 
                            badgeTheme: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', 
                            icon: 'graduation-cap.svg',
                            shadow: 'hover:shadow-orange-500/20'
                          };

                      return (
                        <motion.button 
                          key={level}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedLevel(level)}
                          className={`flex flex-col items-center justify-center p-8 bg-gradient-to-br ${style.bg} rounded-[32px] border-2 ${style.border} ${style.shadow} transition-all duration-300 overflow-hidden group relative text-center`}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 dark:bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
                          
                          <div className="relative w-32 h-32 mb-6 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                            <img 
                              src={`https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/${style.icon}`} 
                              alt={level} 
                              className="w-full h-full object-contain" 
                              onError={(e) => { e.currentTarget.src = "https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/school.svg" }}
                            />
                          </div>
                          
                          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
                            {level}
                          </h3>
                          <p className="text-base text-slate-600 dark:text-slate-400 mb-8 font-medium">
                            {gradeCount} grados · {sectionCount} secciones
                          </p>
                          
                          <div className="w-full bg-white/60 dark:bg-slate-900/60 rounded-2xl p-4 backdrop-blur-md border border-white/40 dark:border-slate-700/50 shadow-sm transition-transform group-hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <Users size={16} className="text-slate-500" /> Estudiantes
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-sm font-black ${style.badgeTheme}`}>
                                {studentsCount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <GraduationCap size={16} className="text-slate-500" /> Docentes
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-sm font-black ${style.badgeTheme}`}>
                                {teachersCount}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : selectedGrade === 'Todos' ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-6 sm:p-8 border border-b-0 border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                      <button onClick={() => setSelectedLevel('Todos')} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedLevel}</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                      Selecciona el grado
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
                      Explora las aulas y estudiantes del nivel {selectedLevel.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDesglosado(!isDesglosado)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${isDesglosado ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'}`}
                  >
                    {isDesglosado ? <Layers size={16} /> : <LayoutGrid size={16} />}
                    {isDesglosado ? 'Agrupar por Grado' : 'Desglosar aulas'} <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
                
                <div className="bg-white dark:bg-slate-900 rounded-b-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                  {isDesglosado ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {Object.entries(EDUCATIONAL_STRUCTURE[selectedLevel as keyof typeof EDUCATIONAL_STRUCTURE]).flatMap(([grade, sections]) => 
                        sections.map((section, index) => {
                          const studentCount = MOCK_USERS.filter(u => u.role === 'Estudiante' && u.level === selectedLevel && u.grade === grade && u.section === section).length;
                          const tutor = MOCK_USERS.find(u => u.role === 'Docente' && u.level === selectedLevel && u.grade === grade && u.section === section);
                          const isInicial = selectedLevel === 'Inicial';
                          return (
                            <motion.div
                              key={`${grade}-${section}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ y: -4 }}
                              onClick={() => onSelectClassroom({ level: selectedLevel, grade, section })}
                              className="group relative bg-white dark:bg-slate-800 p-8 rounded-[24px] border-2 border-gray-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center text-center cursor-pointer"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
                              
                              <div className="relative w-24 h-24 mb-5 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                <img 
                                  src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/books.svg" 
                                  alt="Aula" 
                                  className="w-full h-full object-contain" 
                                  onError={(e) => { e.currentTarget.src = "https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-book.svg" }}
                                />
                              </div>

                              <div className="w-full mt-auto">
                                <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {isInicial ? grade.replace(/Años/i, 'AÑOS') : grade.replace('° Grado', '°')} {section}
                                </h4>

                                <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-slate-700/50 group-hover:border-blue-100 dark:group-hover:border-slate-600 text-left space-y-3 mb-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                      <Users size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Estudiantes
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{studentCount || 28}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                      <GraduationCap size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Tutor
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[100px]" title={tutor ? tutor.name : 'No asignado'}>
                                      {tutor ? tutor.name : 'No asignado'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-3 relative z-10 w-full mt-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectClassroomHistory({ level: selectedLevel, grade, section });
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 shadow-sm"
                                  >
                                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    Reportes
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onRegisterIncident) onRegisterIncident();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-sm text-red-600 dark:text-red-400 shadow-sm group-hover:border-red-300"
                                  >
                                    <AlertTriangle className="w-5 h-5" />
                                    Incidencia
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                      {Object.entries(EDUCATIONAL_STRUCTURE[selectedLevel as keyof typeof EDUCATIONAL_STRUCTURE]).map(([grade, sections], index) => {
                        const totalStudents = sections.reduce((acc, section) => {
                          return acc + MOCK_USERS.filter(u => u.role === 'Estudiante' && u.level === selectedLevel && u.grade === grade && u.section === section).length;
                        }, 0);
                        const totalTeachers = sections.reduce((acc, section) => {
                          return acc + MOCK_USERS.filter(u => u.role === 'Docente' && u.level === selectedLevel && u.grade === grade && u.section === section).length;
                        }, 0);

                        return (
                          <motion.button 
                            key={grade}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedGrade(grade)}
                            className="group relative bg-white dark:bg-slate-800 p-8 rounded-[24px] border-2 border-gray-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center text-center"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
                            
                            <div className="relative w-24 h-24 mb-5 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                              <img 
                                src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/books.svg" 
                                alt="Grade" 
                                className="w-full h-full object-contain" 
                                onError={(e) => { e.currentTarget.src = "https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-book.svg" }}
                              />
                            </div>
                            
                            <div className="w-full mt-auto">
                              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {grade}
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
                                {sections.length} secciones activas
                              </p>
                            
                              <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-slate-700/50 group-hover:border-blue-100 dark:group-hover:border-slate-600 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    <Users size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Estudiantes
                                  </div>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {totalStudents || (index + 1) * 28}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    <GraduationCap size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Docentes
                                  </div>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {totalTeachers || sections.length}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    <UserCheck size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Auxiliares
                                  </div>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {Math.max(1, Math.ceil((totalStudents || (index + 1) * 28) / 30))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-6 sm:p-8 border border-b-0 border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                      <button onClick={() => setSelectedLevel('Todos')} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <button onClick={() => setSelectedGrade('Todos')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                        {selectedLevel}
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedGrade}</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                      Selecciona el aula
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
                      Explora las secciones de {selectedGrade} de {selectedLevel.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-b-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* @ts-ignore */}
                    {EDUCATIONAL_STRUCTURE[selectedLevel][selectedGrade].map((section, index) => {
                      const studentCount = MOCK_USERS.filter(u => u.role === 'Estudiante' && u.level === selectedLevel && u.grade === selectedGrade && u.section === section).length;
                      const tutor = MOCK_USERS.find(u => u.role === 'Docente' && u.level === selectedLevel && u.grade === selectedGrade && u.section === section);
                      
                      const isInicial = selectedLevel === 'Inicial';
                      
                      return (
                        <motion.div
                          key={`${selectedGrade}-${section}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                          onClick={() => onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section })}
                          className="group relative bg-white dark:bg-slate-800 p-8 rounded-[24px] border-2 border-gray-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center text-center cursor-pointer"
                        >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
                              
                              <div className="relative w-24 h-24 mb-5 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                <img 
                                  src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/books.svg" 
                                  alt="Aula" 
                                  className="w-full h-full object-contain" 
                                  onError={(e) => { e.currentTarget.src = "https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-book.svg" }}
                                />
                              </div>

                              <div className="w-full mt-auto">
                                <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {isInicial ? selectedGrade.replace(/Años/i, 'AÑOS') : selectedGrade.replace('° Grado', '°')} {section}
                                </h4>

                                <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-slate-700/50 group-hover:border-blue-100 dark:group-hover:border-slate-600 text-left space-y-3 mb-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                      <Users size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Estudiantes
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{studentCount || 28}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                      <GraduationCap size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> Tutor
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[100px]" title={tutor ? tutor.name : 'No asignado'}>
                                      {tutor ? tutor.name : 'No asignado'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex gap-3 relative z-10 w-full mt-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectClassroomHistory({ level: selectedLevel, grade: selectedGrade, section });
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 shadow-sm"
                                  >
                                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    Reportes
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onRegisterIncident) onRegisterIncident();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-sm text-red-600 dark:text-red-400 shadow-sm group-hover:border-red-300"
                                  >
                                    <AlertTriangle className="w-5 h-5" />
                                    Incidencia
                                  </button>
                                </div>
                              </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

const getScopedReportsHistory = (classroom: { level: string, grade: string, section: string }) => {
  const reports: ReportHistoryItem[] = [];
  let id = 1;
  const REPORT_TYPES = ['Diario', 'Semanal', 'Mensual', 'Bimestral'];
  
  REPORT_TYPES.forEach(type => {
    if (type === 'Diario') {
      const days = [
        { day: 'Lunes 16', date: '16 mar 2026' },
        { day: 'Martes 17', date: '17 mar 2026' },
        { day: 'Miércoles 18', date: '18 mar 2026' },
        { day: 'Jueves 19', date: '19 mar 2026' },
        { day: 'Viernes 20', date: '20 mar 2026' },
      ];
      days.forEach(({ day, date }) => {
        reports.push({
          id: id++,
          type,
          title: `Reporte Diario - ${day} de Marzo`,
          date,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: `${(Math.random() * 1 + 0.5).toFixed(1)} MB`,
          progress: 100
        });
      });
    } else if (type === 'Semanal') {
      const weeks = [
        { title: 'Semana 12', date: 'Marzo 2026' },
        { title: 'Semana 13', date: 'Marzo 2026' },
        { title: 'Semana 14', date: 'Marzo 2026' }
      ];
      weeks.forEach(week => {
        reports.push({
          id: id++,
          type,
          title: `Reporte Semanal - ${week.title}`,
          date: week.date,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
          progress: 100
        });
      });
    } else if (type === 'Mensual') {
      const months = ['Enero', 'Febrero', 'Marzo'];
      months.forEach(month => {
        reports.push({
          id: id++,
          type,
          title: `Reporte Mensual - ${month}`,
          date: `${month} 2026`,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: `${(Math.random() * 3 + 2).toFixed(1)} MB`,
          progress: 100
        });
      });
    } else if (type === 'Bimestral') {
      const bimesters = [
        { title: 'I Bimestre', date: '16-03-2026 al 15-05-2026' },
      ];
      bimesters.forEach(bimester => {
        reports.push({
          id: id++,
          type,
          title: `Reporte Bimestral - ${bimester.title}`,
          date: bimester.date,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: `${(Math.random() * 5 + 3).toFixed(1)} MB`,
          progress: 100
        });
      });
    }
  });
  return reports;
};

const ClassroomReportsHistory: React.FC<{
  classroom: { level: string, grade: string, section: string },
  onBack: () => void,
  onDownloadReport: (type: 'Asistencia' | 'Incidencias', period: 'Día' | 'Semana' | 'Mes' | 'Bimestre', month?: number, bimestre?: number) => void
}> = ({ classroom, onBack, onDownloadReport }) => {
  const [historyPath, setHistoryPath] = useState<string[]>([]);
  const [previewReport, setPreviewReport] = useState<ReportHistoryItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const week = Math.ceil(Math.floor((d.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000)) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBimestre, setSelectedBimestre] = useState('1');

  const scopedReports = useMemo(() => getScopedReportsHistory(classroom), [classroom]);

  const currentFolderContent = useMemo(() => {
    if (historyPath.length === 0) {
      return {
        type: 'folders',
        items: ['Diario', 'Semanal', 'Mensual', 'Bimestral']
      };
    }

    const currentFolder = historyPath[historyPath.length - 1];
    return {
      type: 'files',
      items: scopedReports.filter(r => r.type === currentFolder)
    };
  }, [historyPath, scopedReports]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const tutor = useMemo(() => {
    return MOCK_USERS.find(u => 
      u.role === 'Docente' && 
      u.level === classroom.level && 
      u.grade === classroom.grade && 
      u.section === classroom.section
    );
  }, [classroom]);

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/50">
          <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
            <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
              {classroom.level}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
              {classroom.grade}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{classroom.section}</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Historial de Reportes
          </h2>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-base font-medium">
            <span>{classroom.level === 'Inicial' ? `${classroom.grade.replace(/Años/i, '- AÑOS').toUpperCase()} - ${classroom.section}` : `${classroom.grade.replace('° Grado', '')}°${classroom.section}`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span>{classroom.level}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="flex items-center gap-1.5"><GraduationCap className="w-5 h-5" /> Tutor: {tutor ? tutor.name : 'Sin asignar'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-b-2xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setHistoryPath([])}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${historyPath.length === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <Folder size={18} />
            <span>Reportes</span>
          </button>
          
          {historyPath.map((folder, index) => (
            <React.Fragment key={folder}>
              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
              <button 
                onClick={() => setHistoryPath(historyPath.slice(0, index + 1))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${index === historyPath.length - 1 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                {getFolderStyle(folder, false).icon}
                <span>{folder}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        {currentFolderContent.type === 'folders' ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(currentFolderContent.items as string[]).map(folderName => {
                const style = getFolderStyle(folderName, false);
                return (
                  <button 
                    key={folderName}
                    onClick={() => setHistoryPath([...historyPath, folderName])}
                    className={`group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${style.borderClass}`}
                  >
                    {/* Background subtle glow on hover */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${style.bgClass}`}></div>
                    
                    <div className="relative flex items-center justify-center w-24 h-24 mb-5 rounded-[20px] bg-blue-50 dark:bg-slate-800 text-blue-500 transition-transform duration-200 group-hover:scale-105 shadow-inner border border-blue-100 dark:border-slate-700">
                      <Folder className="w-12 h-12" strokeWidth={1.5} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <h4 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{folderName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{style.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reportes {historyPath[0] === 'Diario' ? 'Diarios' : historyPath[0] === 'Semanal' ? 'Semanales' : historyPath[0] === 'Mensual' ? 'Mensuales' : 'Bimestrales'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {historyPath[0] === 'Diario' ? 'Selecciona una fecha para ver los reportes de ese día.' : historyPath[0] === 'Semanal' ? 'Selecciona una semana para ver los reportes.' : 'Visualiza los reportes generados.'}
                </p>
              </div>
              
              {historyPath[0] === 'Diario' && (
                <div className="shrink-0">
                  <CustomCalendar 
                    mode="date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="Seleccionar Fecha"
                    align="right"
                  />
                </div>
              )}
              {historyPath[0] === 'Semanal' && (
                <div className="shrink-0">
                  <CustomCalendar 
                    mode="week"
                    value={selectedWeek}
                    onChange={setSelectedWeek}
                    placeholder="Seleccionar Semana"
                    align="right"
                  />
                </div>
              )}
              {historyPath[0] === 'Mensual' && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full sm:w-auto appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                    >
                      {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                  <div className="relative w-24">
                    <input 
                      type="number" 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-center transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
              {historyPath[0] === 'Bimestral' && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <select 
                      value={selectedBimestre} 
                      onChange={(e) => setSelectedBimestre(e.target.value)}
                      className="w-full sm:w-auto appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                    >
                      <option value="1">I Bimestre</option>
                      <option value="2">II Bimestre</option>
                      <option value="3">III Bimestre</option>
                      <option value="4">IV Bimestre</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                  <div className="relative w-24">
                    <input 
                      type="number" 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-center transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentFolderContent.items.length > 0 ? (
              (currentFolderContent.items as ReportHistoryItem[]).map(report => {
                const formatShortDate = (dateStr: string) => {
                  const months: Record<string, string> = { 'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' };
                  const match = dateStr.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
                  if (match) {
                    return `${match[1].padStart(2, '0')}/${months[match[2]] || '01'}/${match[3].slice(2)}`;
                  }
                  return dateStr;
                };
                return (
                <div key={report.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded-[14px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                        <FileText className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{report.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formatShortDate(report.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => {
                        const doc = new jsPDF();
                        doc.setFontSize(18);
                        doc.text(report.title, 14, 22);
                        doc.setFontSize(11);
                        doc.text(`${report.date} | ${report.level} - ${report.grade} ${report.section}`, 14, 30);
                        
                        autoTable(doc, {
                          startY: 40,
                          head: [['Estudiante', 'Estado', 'Hora Ingreso', 'Hora Salida']],
                          body: Array.from({ length: 15 }).map((_, i) => [`Estudiante ${i + 1}`, 'Asistió', '07:45 AM', '02:00 PM']),
                        });
                        
                        doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/40 transition-colors text-sm font-bold"
                    >
                      <Download size={18} /> PDF
                    </button>
                    <button 
                      onClick={() => {
                        // Mock Excel download
                        alert(`Descargando Excel para ${report.title}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 dark:hover:bg-emerald-900/40 transition-colors text-sm font-bold"
                    >
                      <Download size={18} /> Excel
                    </button>
                  </div>
                </div>
              )})
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No hay reportes</h3>
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron reportes para los filtros seleccionados.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewReport && (
          <ReportPreviewModal 
            report={previewReport} 
            onClose={() => setPreviewReport(null)} 
          />
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ClassroomDetail: React.FC<{ 
  classroom: { level: string, grade: string, section: string }, 
  onBack: () => void,
  onSelectStudent: (s: UserItem) => void,
  initialShowHistory?: boolean
}> = ({ classroom, onBack, onSelectStudent, initialShowHistory = false }) => {
  const [showReportsHistory, setShowReportsHistory] = useState(initialShowHistory);
  const [showVirtualAttendance, setShowVirtualAttendance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendancePeriod, setAttendancePeriod] = useState<'Día' | 'Semana' | 'Mes' | 'Bimestre'>('Día');
  const [reportPeriod, setReportPeriod] = useState<'Día' | 'Semana' | 'Mes' | 'Bimestre'>('Día');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState<string>(getWeekString(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() >= 2 && new Date().getMonth() <= 11 ? new Date().getMonth() : 2);
  const [selectedBimestre, setSelectedBimestre] = useState<number>(1);

  const [incidentsReportPeriod, setIncidentsReportPeriod] = useState<'Día' | 'Semana' | 'Mes' | 'Bimestre'>('Día');
  const [selectedIncidentsDate, setSelectedIncidentsDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedIncidentsWeek, setSelectedIncidentsWeek] = useState<string>(getWeekString(new Date()));
  const [selectedIncidentsMonth, setSelectedIncidentsMonth] = useState<number>(new Date().getMonth() >= 2 && new Date().getMonth() <= 11 ? new Date().getMonth() : 2);
  const [selectedIncidentsBimestre, setSelectedIncidentsBimestre] = useState<number>(1);

  const [dashboardIncidentsMonth, setDashboardIncidentsMonth] = useState<number>(new Date().getMonth() >= 2 && new Date().getMonth() <= 11 ? new Date().getMonth() : 2);

  const peruDate = useMemo(() => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" })), []);
  
  const weekStr = useMemo(() => {
    const start = new Date(peruDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    
    const startMonth = start.toLocaleDateString('es-PE', { month: 'short' });
    const endMonth = end.toLocaleDateString('es-PE', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${start.getDate()} al ${end.getDate()} ${endMonth}`;
    } else {
      return `${start.getDate()} ${startMonth} al ${end.getDate()} ${endMonth}`;
    }
  }, [peruDate]);

  const dayStr = useMemo(() => peruDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }), [peruDate]);

  const students = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.role === 'Estudiante' && 
      u.level === classroom.level && 
      u.grade === classroom.grade && 
      u.section === classroom.section
    );
  }, [classroom]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Mock data for charts
  const attendanceData = [
    { name: 'ASISTIÓ', value: 21, color: '#10b981' },
    { name: 'FALTAS', value: 2, color: '#ef4444' },
    { name: 'TARDANZAS', value: 1, color: '#f59e0b' },
    { name: 'JUSTIFICADAS', value: 2, color: '#3b82f6' },
  ];

  const weeklyAttendanceData = [
    { name: 'Lun', Presente: 25, Tardanza: 3, Falta: 2 },
    { name: 'Mar', Presente: 28, Tardanza: 1, Falta: 1 },
    { name: 'Mié', Presente: 26, Tardanza: 2, Falta: 2 },
    { name: 'Jue', Presente: 29, Tardanza: 0, Falta: 1 },
    { name: 'Vie', Presente: 24, Tardanza: 4, Falta: 2 },
  ];

  const incidentsData = [
    { name: 'Leve', value: 20, color: '#f59e0b' },
    { name: 'Moderado', value: 12, color: '#f97316' },
    { name: 'Grave', value: 5, color: '#ef4444' },
  ];

  const handleDownloadReport = (type: 'Asistencia' | 'Incidencias') => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Título Principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`REPORTE DE ${type.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });

    // Cuadro de Información
    const startY = 30;
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin, startY, pageWidth - (margin * 2), 20);
    
    let periodText = '';
    const currentReportPeriod = type === 'Asistencia' ? reportPeriod : incidentsReportPeriod;
    const currentDate = type === 'Asistencia' ? selectedDate : selectedIncidentsDate;
    const currentWeek = type === 'Asistencia' ? selectedWeek : selectedIncidentsWeek;
    const currentMonth = type === 'Asistencia' ? selectedMonth : selectedIncidentsMonth;
    const currentBimestre = type === 'Asistencia' ? selectedBimestre : selectedIncidentsBimestre;

    if (currentReportPeriod === 'Día') {
      periodText = `DÍA: ${new Date(currentDate + 'T12:00:00').toLocaleDateString('es-PE')}`;
    } else if (currentReportPeriod === 'Semana') {
      const weekStart = getDateFromWeekString(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      periodText = `SEMANA: ${weekStart.toLocaleDateString('es-PE')} - ${weekEnd.toLocaleDateString('es-PE')}`;
    } else if (currentReportPeriod === 'Mes') {
      const monthLabel = MONTHS.find(m => m.value === currentMonth)?.label || '';
      periodText = `MES: ${monthLabel.toUpperCase()}`;
    } else {
      periodText = `BIMESTRE: ${currentBimestre}°`;
    }

    doc.setFontSize(9);
    doc.text(`NIVEL: ${classroom.level.toUpperCase()}`, margin + 5, startY + 7);
    doc.text(`GRADO/SECCIÓN: ${classroom.grade.toUpperCase()} ${classroom.section.toUpperCase()}`, margin + 5, startY + 14);
    doc.text(periodText, margin + 100, startY + 7);

    // Table Data
    let head = [];
    let tableData = [];

    if (type === 'Asistencia') {
      head = [['#', 'ESTUDIANTE', 'ASISTENCIA (%)', 'TARDANZAS', 'FALTAS']];
      tableData = filteredStudents.map((s, index) => [
        (index + 1).toString(),
        s.name,
        `${Math.floor(Math.random() * 20 + 80)}%`, // Mock data 80-100%
        Math.floor(Math.random() * 5).toString(),  // Mock data 0-4
        Math.floor(Math.random() * 3).toString()   // Mock data 0-2
      ]);
    } else {
      head = [['#', 'ESTUDIANTE', 'INCIDENCIAS LEVES', 'MODERADAS', 'GRAVES']];
      tableData = filteredStudents.map((s, index) => [
        (index + 1).toString(),
        s.name,
        Math.floor(Math.random() * 3).toString(), // Mock data 0-2
        Math.floor(Math.random() * 2).toString(), // Mock data 0-1
        Math.floor(Math.random() * 1).toString()  // Mock data 0
      ]);
    }

    autoTable(doc, {
      startY: startY + 25,
      head: head,
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.2
      },
      margin: { left: margin, right: margin }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      doc.text(`Generado el: ${dateStr}`, margin, footerY);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    }

    let fileNameSuffix = '';
    if (currentReportPeriod === 'Día') {
      fileNameSuffix = `Dia_${new Date(currentDate + 'T12:00:00').toLocaleDateString('es-PE').replace(/\//g, '-')}`;
    } else if (currentReportPeriod === 'Semana') {
      const weekStart = getDateFromWeekString(currentWeek);
      fileNameSuffix = `Semana_${weekStart.toLocaleDateString('es-PE').replace(/\//g, '-')}`;
    } else if (currentReportPeriod === 'Mes') {
      const monthLabel = MONTHS.find(m => m.value === currentMonth)?.label || '';
      fileNameSuffix = `Mes_${monthLabel}`;
    } else {
      fileNameSuffix = `Bimestre_${currentBimestre}`;
    }

    doc.save(`Reporte_${type}_${classroom.grade.replace('° Grado', '')}${classroom.section}_${fileNameSuffix}.pdf`);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
              <span className="font-semibold text-slate-800 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const tutor = useMemo(() => {
    return MOCK_USERS.find(u => 
      u.role === 'Docente' && 
      u.level === classroom.level && 
      u.grade === classroom.grade && 
      u.section === classroom.section
    );
  }, [classroom]);

  if (showReportsHistory) {
    return <ClassroomReportsHistory 
      classroom={classroom} 
      onBack={onBack} 
      onDownloadReport={(type, period, month, bimestre) => {
        if (type === 'Incidencias') {
          setIncidentsReportPeriod(period);
          if (month !== undefined) setSelectedIncidentsMonth(month);
          if (bimestre !== undefined) setSelectedIncidentsBimestre(bimestre);
          setTimeout(() => handleDownloadReport('Incidencias'), 0);
        } else {
          setReportPeriod(period);
          if (month !== undefined) setSelectedMonth(month);
          if (bimestre !== undefined) setSelectedBimestre(bimestre);
          setTimeout(() => handleDownloadReport('Asistencia'), 0);
        }
      }}
    />;
  }

  if (showVirtualAttendance) {
    return <VirtualAttendance 
      classroom={classroom} 
      students={students}
      onBack={() => setShowVirtualAttendance(false)} 
    />;
  }

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/50">
          
          {/* Header & Charts Section (Grey) */}
          <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-8 border border-b-0 border-gray-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 w-fit">
                  <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                    {classroom.level}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                    {classroom.grade}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{classroom.section}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-[20px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400">
                    <span className="text-3xl font-black text-white font-poppins leading-none">
                      {classroom.section}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {classroom.level === 'Inicial' ? `${classroom.grade.replace(/Años/i, '- AÑOS').toUpperCase()} - ${classroom.section}` : `${classroom.grade.replace('° Grado', '')}°${classroom.section}`}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mt-2 font-medium text-base">
                      <span>{classroom.level}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                      <GraduationCap className="w-5 h-5" />
                      <span>Tutor: {tutor ? tutor.name : 'Sin asignar'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 ml-2"></span>
                      <User className="w-5 h-5" />
                      <span>Aux: {tutor ? tutor.name.split(' ')[0] + ' Aux' : 'Sin asignar'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Reportes Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowVirtualAttendance(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm font-medium"
                >
                  <MonitorPlay className="w-5 h-5" />
                  Asistencia Virtual
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Asistencia General</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Semana: {weekStr}</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
              <button
                onClick={() => setAttendancePeriod('Día')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${attendancePeriod === 'Día' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Hoy
              </button>
              <button
                onClick={() => setAttendancePeriod('Semana')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${attendancePeriod === 'Semana' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="flex-1 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 min-h-[250px] flex flex-col w-full">
            {attendancePeriod === 'Semana' ? (
              <div className="w-full flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAttendanceData} margin={{ top: 20, right: 20, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="Presente" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} maxBarSize={40} />
                    <Bar dataKey="Tardanza" stackId="a" fill="#f59e0b" maxBarSize={40} />
                    <Bar dataKey="Falta" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full flex-1">
                <div className="w-1/2 h-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">81%</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">{dayStr}</span>
                  </div>
                </div>
                <div className="w-1/2 flex flex-col justify-center gap-4 pl-8">
                  {attendanceData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Incidencias por Categoría</h3>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <button onClick={() => setDashboardIncidentsMonth(prev => prev > 2 ? prev - 1 : 11)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200 min-w-[80px] text-center">
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][dashboardIncidentsMonth]}
              </span>
              <button onClick={() => setDashboardIncidentsMonth(prev => prev < 11 ? prev + 1 : 2)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          <div className="flex-1 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 min-h-[250px] flex flex-col w-full">
            <div className="flex items-center justify-center h-full flex-1 min-h-0">
              <div className="w-1/2 h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentsData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {incidentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">37</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider mt-1">TOTAL</span>
                </div>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-4 pl-8">
                {incidentsData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        
    {/* Students List Section (White) */}
    <div className="bg-white dark:bg-slate-900 rounded-b-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col min-h-0">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-[500px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-base text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <Users className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            <h3 className="text-xl font-medium text-slate-500 dark:text-slate-400">
              {students.length} Estudiantes
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12 text-center">#</th>
                <th className="p-4 font-semibold">Estudiante</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 text-center text-slate-400 dark:text-slate-500 font-mono text-sm font-medium">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${student.avatarColor}`}>
                          {student.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors ml-2">
                          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 rotate-180 transition-colors" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p>No se encontraron estudiantes que coincidan con la búsqueda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
};

const StudentDetail: React.FC<{ student: UserItem, onBack: () => void, isParentView?: boolean }> = ({ student, onBack, isParentView }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() >= 2 && new Date().getMonth() <= 11 ? new Date().getMonth() : 2);
  const [justifiedDays, setJustifiedDays] = useState<Record<string, string>>({});
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [isAttendanceNotificationsModalOpen, setIsAttendanceNotificationsModalOpen] = useState(false);
  const [activeAttendanceTab, setActiveAttendanceTab] = useState<'asistencia' | 'salidas'>('asistencia');
  const [parentViewIncident, setParentViewIncident] = useState<any>(null);
  const [showWebhookSimulation, setShowWebhookSimulation] = useState(false);
  const [dayToJustify, setDayToJustify] = useState<any>(null);
  const [justificationObservation, setJustificationObservation] = useState('');
  const [incidentSignatures, setIncidentSignatures] = useState<Record<string, { status: 'pending' | 'signed', date?: string, ip?: string }>>({
    'inc-1': { status: 'pending' },
    'inc-2': { status: 'signed', date: '2026-03-06 14:20', ip: '192.168.1.45' }
  });

  const months = [
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  const calendarData = useMemo(() => {
    const year = new Date().getFullYear();
    const data = [];
    const firstDay = new Date(year, selectedMonth, 1);
    const lastDay = new Date(year, selectedMonth + 1, 0);
    
    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6; // Sunday

    for (let i = 0; i < startOffset; i++) {
        data.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const current = new Date(year, selectedMonth, d);
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      
      let status = 'Sin registro';
      let color = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
      
      if (!isWeekend) {
        const hash = current.getDate() + student.name.charCodeAt(0) + selectedMonth;
        status = 'Presente';
        color = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-sm';
        if (hash % 10 === 0) { status = 'Falta'; color = 'bg-rose-500 border-2 border-rose-600 text-white shadow-sm'; }
        else if (hash % 7 === 0) { status = 'Tardanza'; color = 'bg-amber-500 border-2 border-amber-600 text-white shadow-sm'; }
        
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        if (justifiedDays[dateStr]) {
          status = `${status} (Justificada)`;
          color = 'bg-blue-500 border-2 border-blue-600 text-white shadow-sm';
        }
      }

      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      data.push({
        date: dateStr,
        dayNumber: d,
        isWeekend,
        status,
        color,
        originalStatus: status.split(' ')[0]
      });
    }
    return data;
  }, [student.name, selectedMonth, justifiedDays]);

  const [incidentsPage, setIncidentsPage] = useState(1);

  // Estados para el reporte del estudiante
  const [reportPeriod, setReportPeriod] = useState<'Día' | 'Semana' | 'Mes' | 'Bimestre'>('Día');
  const [reportType, setReportType] = useState<'Asistencia' | 'Incidencias' | 'Completo'>('Completo');
  const [selectedReportDate, setSelectedReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedReportWeek, setSelectedReportWeek] = useState<string>(getWeekString(new Date()));
  const [selectedReportMonth, setSelectedReportMonth] = useState<number>(new Date().getMonth() >= 2 && new Date().getMonth() <= 11 ? new Date().getMonth() : 2);
  const [selectedReportBimestre, setSelectedReportBimestre] = useState<number>(1);

  // Reset page when month changes
  useEffect(() => {
    setIncidentsPage(1);
  }, [selectedMonth]);

  // Mock data for personal incidents combined with attendance
  const personalIncidents = useMemo(() => {
    const year = new Date().getFullYear();
    const monthAttendance = [];
    
    // Generate attendance for the selected month to show in incidents list
    const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const current = new Date(year, selectedMonth, d);
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      if (!isWeekend) {
        const hash = d + student.name.charCodeAt(0) + selectedMonth;
        let status = 'Presente';
        if (hash % 10 === 0) { status = 'Falta'; }
        else if (hash % 7 === 0) { status = 'Tardanza'; }
        
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        const isJustified = justifiedDays[dateStr] !== undefined;
        
        monthAttendance.push({
          date: dateStr,
          originalStatus: status,
          isJustified,
          justification: justifiedDays[dateStr]
        });
      }
    }

    const attendanceIncidents = monthAttendance.flatMap(d => {
      const isFalta = d.originalStatus === 'Falta';
      const isTardanza = d.originalStatus === 'Tardanza';
      const isPresente = d.originalStatus === 'Presente';
      
      const entryId = `att-in-${d.date}`;
      const exitId = `att-out-${d.date}`;
      
      const incidents = [];
      
      // Ingreso
      incidents.push({
        id: entryId,
        date: d.date,
        time: isFalta ? '08:00 AM' : (isTardanza ? '08:15 AM' : '07:50 AM'),
        teacher: null,
        originalStatus: d.originalStatus,
        type: {
          id: isFalta ? 'falta' : (isTardanza ? 'tardanza' : 'ingreso'),
          label: isFalta ? 'Inasistencia' : (isTardanza ? 'Tardanza' : 'Ingreso'),
          category: isFalta ? 'Grave' : (isTardanza ? 'Leve' : 'Informativo'),
          icon: isFalta ? AlertTriangle : (isTardanza ? Clock : CheckCircle2),
          color: d.isJustified 
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : (isFalta ? 'bg-rose-50 text-rose-700 border-rose-200' : (isTardanza ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'))
        },
        description: d.isJustified 
          ? `Justificada: ${d.justification || 'Sin observación'}` 
          : `Registro de ${d.originalStatus.toLowerCase()} en el sistema de asistencia.`,
        signatureStatus: incidentSignatures[entryId]?.status || 'Esperando confirmación',
        signatureDate: incidentSignatures[entryId]?.date,
        signatureIp: incidentSignatures[entryId]?.ip
      });

      // Salida (only if not Falta)
      if (!isFalta) {
        incidents.push({
          id: exitId,
          date: d.date,
          time: '02:00 PM',
          teacher: null,
          originalStatus: 'Salida',
          type: {
            id: 'salida',
            label: 'Salida',
            category: 'Informativo',
            icon: CheckCircle2,
            color: 'bg-slate-50 text-slate-700 border-slate-200'
          },
          description: `Registro de salida del estudiante.`,
          signatureStatus: incidentSignatures[exitId]?.status || 'Esperando confirmación',
          signatureDate: incidentSignatures[exitId]?.date,
          signatureIp: incidentSignatures[exitId]?.ip
        });
      }
      
      return incidents;
    });

    const mockIncidents = [
      { id: 'inc-1', date: `${year}-${String(selectedMonth + 1).padStart(2, '0')}-15`, time: '10:30 AM', teacher: 'Prof. María Gómez', type: INCIDENT_TYPES[0], description: 'Discusión en el recreo' },
      { id: 'inc-2', date: `${year}-${String(selectedMonth + 1).padStart(2, '0')}-05`, time: '08:15 AM', teacher: 'Prof. Carlos Ruiz', type: INCIDENT_TYPES[4], description: 'No presentó la tarea de matemáticas' },
    ].map(inc => ({
      ...inc,
      signatureStatus: incidentSignatures[inc.id]?.status || 'Esperando confirmación',
      signatureDate: incidentSignatures[inc.id]?.date,
      signatureIp: incidentSignatures[inc.id]?.ip
    }));

    return [...mockIncidents, ...attendanceIncidents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [student.name, selectedMonth, justifiedDays, incidentSignatures]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (incidentsPage - 1) * 5;
    return personalIncidents.slice(startIndex, startIndex + 5);
  }, [personalIncidents, incidentsPage]);

  const totalIncidentPages = Math.ceil(personalIncidents.length / 5);

  const handleOpenJustifyModal = (record: any) => {
    if (record.originalStatus === 'Falta' || record.originalStatus === 'Tardanza') {
      setDayToJustify(record);
      setJustificationObservation('');
      setIsJustifyModalOpen(true);
    }
  };

  const handleConfirmJustification = () => {
    if (!dayToJustify) return;
    setJustifiedDays(prev => ({
      ...prev,
      [dayToJustify.date]: justificationObservation || 'Sin observación'
    }));
    setIsJustifyModalOpen(false);
    setDayToJustify(null);
  };

  const handleDownloadPersonalReport = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
    doc.text(`REGISTRO DE ${reportType.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });
    
    // Subheader info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TIPO: ESTUDIANTES', 14, 35);
    doc.text('NIVEL: INICIAL', 70, 35);
    doc.text('GRADO: 3 AÑOS', 130, 35);
    doc.text('SECCIÓN: MARGARITAS', 190, 35);
    
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const currentMonthName = monthNames[selectedReportMonth];
    const currentYear = new Date().getFullYear();
    doc.text(`MES: ${currentMonthName} ${currentYear}`, 250, 35);

    // Draw border for subheader
    doc.rect(12, 28, pageWidth - 24, 10);

    if (reportType === 'Asistencia') {
      // Generate days for the month
      const daysInMonth = new Date(currentYear, selectedReportMonth + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      
      const dayLetters = days.map(day => {
        const date = new Date(currentYear, selectedReportMonth, day);
        const dayOfWeek = date.getDay();
        return ['D', 'L', 'M', 'M', 'J', 'V', 'S'][dayOfWeek];
      });

      const head = [
        [
          { content: 'N°', rowSpan: 2, styles: { halign: 'center' as const, valign: 'middle' as const } },
          { content: 'APELLIDOS Y NOMBRES', rowSpan: 2, styles: { halign: 'center' as const, valign: 'middle' as const } },
          ...days.map(d => ({ content: d.toString(), styles: { halign: 'center' as const, cellPadding: 1 } }))
        ],
        [
          ...dayLetters.map(l => ({ content: l, styles: { halign: 'center' as const, cellPadding: 1 } }))
        ]
      ];

      const body = [
        [
          1,
          `${student.lastName} ${student.firstName}`.toUpperCase(),
          ...days.map(day => {
            const date = new Date(currentYear, selectedReportMonth, day);
            const dayOfWeek = date.getDay();
            
            if (dayOfWeek === 0 || dayOfWeek === 6) {
               return ''; // Weekend
            } else {
               // Use actual calendar data if available
               const record = calendarData.find(r => r && r.dayNumber === day);
               if (record) {
                 if (record.originalStatus === 'Falta') return { content: 'F', styles: { textColor: [255, 0, 0] as [number, number, number] } };
                 if (record.originalStatus === 'Tardanza') return { content: 'T', styles: { textColor: [255, 165, 0] as [number, number, number] } };
                 if (record.status.includes('Justificada')) return { content: 'J', styles: { textColor: [0, 0, 255] as [number, number, number] } };
               }
               return ''; // Present
            }
          })
        ]
      ];

      autoTable(doc, {
        startY: 40,
        head: head,
        body: body,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 50 },
        },
      });

      // Legend
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('. Asistió   F Faltó   T Tardanza   J Falta justificada', 14, finalY + 5);
      
      // Print date
      const printDate = new Date().toLocaleString('es-PE');
      doc.text(`Impreso: ${printDate}`, pageWidth - 14, finalY + 5, { align: 'right' });

    } else if (reportType === 'Incidencias') {
      const head = [['Fecha', 'Hora', 'Tipo', 'Descripción', 'Registrado por']];
      const body = personalIncidents.map(inc => [
        inc.date,
        inc.time || '10:30 AM',
        inc.type.label,
        inc.description,
        inc.teacher || 'Prof. María García'
      ]);

      autoTable(doc, {
        startY: 40,
        head: head,
        body: body,
        theme: 'grid',
        styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      const printDate = new Date().toLocaleString('es-PE');
      doc.setFontSize(8);
      doc.text(`Impreso: ${printDate}`, pageWidth - 14, finalY + 5, { align: 'right' });
    }

    doc.save(`Reporte_${reportType}_${student.firstName}_${student.lastName}.pdf`);
  };

  const unconfirmedAttendancesCount = useMemo(() => {
    return personalIncidents.filter(inc => inc.id.startsWith('att-') && inc.signatureStatus === 'Esperando confirmación').length;
  }, [personalIncidents]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 font-poppins">
      <div className="flex items-center space-x-4">
        {!isParentView && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        )}
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md ${student.avatarColor}`}>
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{student.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-base font-medium">
                DNI: {student.dni}
              </span>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-base font-medium">
                {student.level === 'Inicial' ? student.section : `${student.grade.replace('° Grado', '')}°${student.section}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {unconfirmedAttendancesCount > 3 && (
        <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-rose-700 dark:text-rose-300 font-bold text-sm">Alerta de Confirmación de Asistencia</h4>
            <p className="text-rose-600 dark:text-rose-400 text-sm mt-1">
              El padre/apoderado tiene <strong>{unconfirmedAttendancesCount} notificaciones de asistencia</strong> sin confirmar. Se recomienda contactar a la familia.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Heatmap Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Asistencia</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                <button onClick={() => setSelectedMonth(prev => prev > 2 ? prev - 1 : 11)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 min-w-[80px] text-center">
                  {months.find(m => m.value === selectedMonth)?.label}
                </span>
                <button onClick={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 2)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              <button 
                onClick={() => setIsAttendanceNotificationsModalOpen(true)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm min-w-[44px] flex justify-center items-center relative" 
                title="Ver Notificaciones de Asistencia"
              >
                <Bell className="w-5 h-5" />
                {unconfirmedAttendancesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unconfirmedAttendancesCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => { setReportType('Asistencia'); setReportPeriod('Mes'); setSelectedReportMonth(selectedMonth); setTimeout(handleDownloadPersonalReport, 0); }} 
                className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm min-w-[44px] flex justify-center items-center" 
                title="Descargar Asistencia"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 flex-1 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-7 gap-3">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {day}
                </div>
              ))}
              {calendarData.map((record, idx) => {
                if (!record) {
                  return <div key={`empty-${idx}`} className="aspect-square"></div>;
                }
                return (
                  <div 
                    key={idx} 
                    onClick={() => !record.isWeekend && handleOpenJustifyModal(record)}
                    className={`relative aspect-square rounded-2xl ${record.isWeekend ? 'bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 font-bold' : record.color} group ${(!record.isWeekend && (record.originalStatus === 'Falta' || record.originalStatus === 'Tardanza')) ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : 'cursor-help'} transition-transform hover:scale-105 flex items-center justify-center`}
                  >
                    <span className="text-lg font-bold">
                      {record.dayNumber}
                    </span>
                    {!record.isWeekend && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-2xl backdrop-blur-sm z-10">
                        <span className="text-white text-[10px] font-bold text-center leading-tight px-1">
                          {record.status}
                          {(record.originalStatus === 'Falta' || record.originalStatus === 'Tardanza') && !record.status.includes('Justificada') && (
                            <span className="block text-[8px] text-blue-300 mt-1">Click para justificar</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-600"></div> Presente</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-600"></div> Tardanza</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-rose-600"></div> Falta</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600"></div> Justificada</div>
            </div>
          </div>
        </div>

        {/* Incidents Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Incidencias</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-sm font-bold">
                <AlertTriangle className="w-4 h-4" />
                {calendarData.filter(d => d?.originalStatus === 'Falta').length} Faltas
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-bold">
                <Clock className="w-4 h-4" />
                {calendarData.filter(d => d?.originalStatus === 'Tardanza').length} Tardanzas
              </div>
              <button 
                onClick={() => { setReportType('Incidencias'); setReportPeriod('Mes'); setSelectedReportMonth(selectedMonth); setTimeout(handleDownloadPersonalReport, 0); }} 
                className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm min-w-[48px] flex justify-center" 
                title="Descargar Incidencias"
              >
                <Download className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-5 flex-1 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
            {personalIncidents.length > 0 ? (
              <>
                <div className="space-y-4 flex-1">
                  {paginatedIncidents.map((incident, idx) => {
                    const Icon = incident.type.icon;
                    const isSevere = incident.type.category === 'Grave';
                    return (
                      <div key={idx} className={`p-5 bg-white dark:bg-slate-800 rounded-xl border ${isSevere ? 'border-rose-200 dark:border-rose-900/50 shadow-rose-100 dark:shadow-rose-900/20' : 'border-slate-200 dark:border-slate-700'} shadow-sm hover:shadow-md transition-all flex gap-4`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${incident.type.color.includes('rose') ? 'bg-rose-600 text-white' : incident.type.color.includes('amber') ? 'bg-amber-500 text-white' : incident.type.color.includes('blue') ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-800 dark:text-white text-base uppercase tracking-wide">{incident.type.label}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isSevere ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {incident.type.category}
                            </span>
                            {incident.signatureStatus && (
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${incident.signatureStatus === 'Confirmado por el padre' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {incident.signatureStatus === 'Confirmado por el padre' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {incident.signatureStatus === 'Confirmado por el padre' ? 'Confirmado por el padre' : 'Esperando confirmación'}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">{incident.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {incident.date}
                              </div>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {incident.time}
                              </div>
                              {incident.teacher && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {incident.teacher}
                                  </div>
                                </>
                              )}
                            </div>
                            {incident.signatureStatus === 'Esperando confirmación' && (
                              <button 
                                onClick={() => {
                                  setParentViewIncident(incident);
                                  setShowWebhookSimulation(false);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg text-xs font-bold transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Simular WhatsApp
                              </button>
                            )}
                            {incident.signatureStatus === 'Confirmado por el padre' && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700" title={`IP: ${incident.signatureIp}`}>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                {incident.signatureDate}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalIncidentPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setIncidentsPage(p => Math.max(1, p - 1))}
                      disabled={incidentsPage === 1}
                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Página {incidentsPage} de {totalIncidentPages}
                    </span>
                    <button
                      onClick={() => setIncidentsPage(p => Math.min(totalIncidentPages, p + 1))}
                      disabled={incidentsPage === totalIncidentPages}
                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Excelente comportamiento</p>
                <p className="text-sm mt-1">No se registran incidencias para este estudiante.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE JUSTIFICACIÓN */}
      <AnimatePresence>
        {isJustifyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJustifyModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shadow-sm">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Justificar {dayToJustify?.originalStatus}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Validación Manual</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsJustifyModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex gap-3 mb-6">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                    Asegúrate de que los documentos físicos presentados sean correctos. Esta acción quedará registrada en el historial.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estudiante</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Fecha: {dayToJustify?.date}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-widest">Motivo / Observación (Opcional)</label>
                    <textarea 
                      value={justificationObservation}
                      onChange={(e) => setJustificationObservation(e.target.value)}
                      placeholder="Ej: Presentó certificado médico físico..."
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-200 transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button 
                    onClick={() => setIsJustifyModalOpen(false)}
                    className="py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmJustification}
                    className="py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VISTA WHATSAPP MODAL */}
      <AnimatePresence>
        {parentViewIncident && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setParentViewIncident(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <div className="relative flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-4xl pointer-events-none">
              
              {/* Phone Simulation */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm h-[80vh] max-h-[700px] bg-[#efeae2] rounded-[40px] shadow-2xl border-[12px] border-slate-900 overflow-hidden flex flex-col pointer-events-auto"
                style={{ backgroundImage: 'url("https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(239, 234, 226, 0.9)' }}
              >
                {/* Mobile Status Bar Simulation */}
                <div className="h-7 bg-[#075e54] w-full flex justify-between items-center px-5 shrink-0 text-white/90 text-[10px] font-medium">
                  <span>18:47</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/80"></div>
                  </div>
                </div>
                
                {/* WhatsApp Header */}
                <div className="bg-[#075e54] text-white p-3 shadow-md relative z-10 shrink-0 flex items-center gap-3">
                  <button onClick={() => setParentViewIncident(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors -ml-1">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-semibold leading-tight">Colegio Ricardo Palma</h2>
                    <p className="text-white/70 text-xs">bot oficial</p>
                  </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  <div className="flex justify-center">
                    <span className="bg-[#e1f3fb] text-slate-600 text-xs px-3 py-1 rounded-lg shadow-sm">HOY</span>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[90%] relative">
                    <div className="text-sm text-slate-800 space-y-3">
                      <p className="font-bold flex items-center gap-2">
                        🚨 Notificación de Incidencia
                      </p>
                      <p>
                        Estimado padre de familia, se ha registrado una incidencia conductual del estudiante <span className="font-semibold text-[#075e54]">{student.name} ({student.level === 'Inicial' ? student.section : `${student.grade.replace('° Grado', '')}°${student.section}`})</span>.
                      </p>
                      <p>Detalle: {parentViewIncident.description}</p>
                      <p>Por favor, confirme que ha recibido este aviso digital.</p>
                      <p className="text-[10px] text-slate-400 italic">ID de Registro: {parentViewIncident.id?.toUpperCase() || 'INC-2026-001'}</p>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-[10px] text-slate-400">18:47</span>
                    </div>
                    
                    {/* Interactive Buttons */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                      {incidentSignatures[parentViewIncident.id]?.status === 'Confirmado por el padre' ? (
                        <div className="flex items-center justify-center gap-2 py-2 text-[#075e54] font-medium text-sm">
                          <Check className="w-4 h-4" /> Confirmado por el padre
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setShowWebhookSimulation(true);
                            setTimeout(() => {
                              setIncidentSignatures(prev => ({
                                ...prev,
                                [parentViewIncident.id]: { status: 'Confirmado por el padre', date: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }), ip: '190.234.x.x' }
                              }));
                            }, 1500);
                          }}
                          className="flex items-center justify-center gap-2 py-2 text-[#00a884] font-medium text-sm hover:bg-slate-50 rounded-md transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirmar de Enterado
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Parent Reply (if signed) */}
                  {incidentSignatures[parentViewIncident.id]?.status === 'Confirmado por el padre' && (
                    <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 shadow-sm max-w-[80%] self-end relative">
                      <p className="text-sm text-slate-800">✅ Conforme</p>
                      <div className="text-right mt-1 flex items-center justify-end gap-1">
                        <span className="text-[10px] text-slate-500">18:48</span>
                        <Check className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Webhook Simulation Terminal */}
              <AnimatePresence>
                {showWebhookSimulation && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md bg-[#1e1e1e] rounded-xl shadow-2xl border border-slate-700 overflow-hidden font-mono text-sm pointer-events-auto"
                  >
                    <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-slate-700">
                      <span className="text-emerald-400 font-bold text-xs">SIMULACIÓN WEBHOOK WAHA</span>
                      <span className="bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">RECIBIDO</span>
                    </div>
                    <div className="p-4 text-slate-300 space-y-1">
                      <p>{'{'}</p>
                      <p className="pl-4"><span className="text-blue-400">"event"</span>: <span className="text-amber-300">"message.create"</span>,</p>
                      <p className="pl-4"><span className="text-blue-400">"payload"</span>: {'{'}</p>
                      <p className="pl-8"><span className="text-blue-400">"from"</span>: <span className="text-amber-300">"51900000000@c.us"</span>,</p>
                      <p className="pl-8"><span className="text-blue-400">"body"</span>: <span className="text-amber-300">"✅ Conforme"</span>,</p>
                      <p className="pl-8"><span className="text-blue-400">"selectedButtonId"</span>: <span className="text-amber-300">"CONFORME_LECTURA"</span>,</p>
                      <p className="pl-8"><span className="text-blue-400">"timestamp"</span>: <span className="text-purple-400">{Math.floor(Date.now() / 1000)}</span></p>
                      <p className="pl-4">{'}'}</p>
                      <p>{'}'}</p>
                      
                      {incidentSignatures[parentViewIncident.id]?.status === 'Confirmado por el padre' && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 pt-4 border-t border-slate-700 text-emerald-400 font-bold"
                        >
                          Acción: Guardando firma digital en Base de Datos para auditoría UGEL...
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance Notifications Modal */}
      <AnimatePresence>
        {isAttendanceNotificationsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Estado de Notificaciones</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ingresos y salidas de {student.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAttendanceNotificationsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                {unconfirmedAttendancesCount > 0 && (
                  <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-amber-800 dark:text-amber-300 font-bold text-sm">Acción Requerida</h4>
                      <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                        Hay {unconfirmedAttendancesCount} notificaciones esperando confirmación del padre/apoderado.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveAttendanceTab('asistencia')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeAttendanceTab === 'asistencia' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                  >
                    Asistencia
                  </button>
                  <button
                    onClick={() => setActiveAttendanceTab('salidas')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeAttendanceTab === 'salidas' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                  >
                    Salidas
                  </button>
                </div>

                <div className="space-y-4">
                  {personalIncidents.filter(inc => inc.id.startsWith(activeAttendanceTab === 'asistencia' ? 'att-in-' : 'att-out-')).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No hay notificaciones de {activeAttendanceTab === 'asistencia' ? 'asistencia' : 'salida'} registradas.
                    </div>
                  ) : (
                    personalIncidents.filter(inc => inc.id.startsWith(activeAttendanceTab === 'asistencia' ? 'att-in-' : 'att-out-')).map(incident => (
                      <div key={incident.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${incident.type.color}`}>
                            <incident.type.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 dark:text-white">{incident.type.label}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {incident.date}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {incident.time}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{incident.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 ${incident.signatureStatus === 'Confirmado por el padre' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {incident.signatureStatus === 'Confirmado por el padre' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {incident.signatureStatus === 'Confirmado por el padre' ? 'Confirmado por el padre' : 'Esperando confirmación'}
                          </span>
                          
                          {incident.signatureStatus === 'Confirmado por el padre' ? (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-500" /> {incident.signatureDate}
                            </span>
                          ) : (
                            <button 
                              onClick={() => {
                                setIsAttendanceNotificationsModalOpen(false);
                                setParentViewIncident(incident);
                                setShowWebhookSimulation(false);
                              }}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" /> Simular WhatsApp
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const CitationsPanel: React.FC<{
  classroom: { level: string, grade: string, section: string },
  students: UserItem[],
  tutor?: UserItem,
  onBack: () => void
}> = ({ classroom, students, tutor, onBack }) => {
  // Generate some mock citations based on the student list
  const [citations, setCitations] = useState(() => {
    return students.slice(0, 5).map((student, idx) => {
      let reason = '';
      let type: 'Leve' | 'Moderada' | 'Grave' | 'Académica' = 'Leve';
      let incidentHistory: any[] = [];
      let status: 'Pendiente' | 'Proceso' | 'Confirmada' = 'Pendiente';

      if (idx === 0) {
        reason = 'Acumulación de 3 incidencias leves';
        type = 'Leve';
        incidentHistory = [
          { date: '10/04/2026', time: '08:15', reportedBy: 'Ana Rojas', description: 'Uso de joyas', type: 'Leve' },
          { date: '12/04/2026', time: '10:00', reportedBy: 'Ana Rojas', description: 'Uñas pintadas', type: 'Leve' },
          { date: '15/04/2026', time: '12:20', reportedBy: 'Ana Rojas', description: 'Uniforme incompleto', type: 'Leve' },
        ];
        status = 'Pendiente';
      } else if (idx === 1) {
        reason = 'Acumulación de 2 incidencias moderadas';
        type = 'Moderada';
        incidentHistory = [
          { date: '08/04/2026', time: '10:15', reportedBy: 'Jorge Silva', description: 'Indisciplina en aula', type: 'Moderada' },
          { date: '16/04/2026', time: '09:10', reportedBy: 'Carlos Mendoza', description: 'Falta de respeto al docente', type: 'Moderada' },
        ];
        status = 'Proceso';
      } else if (idx === 2) {
        reason = '1 Incidencia Grave reportada';
        type = 'Grave';
        incidentHistory = [
          { date: '16/04/2026', time: '14:30', reportedBy: 'Rosa Paredes', description: 'Agresión física', type: 'Grave' },
        ];
        status = 'Confirmada';
      } else if (idx === 3) {
        reason = '2 Incidencias leves (En límite)';
        type = 'Leve';
        incidentHistory = [
          { date: '01/04/2026', time: '08:15', reportedBy: 'Ana Rojas', description: 'Uso de joyas', type: 'Leve' },
          { date: '03/04/2026', time: '11:30', reportedBy: 'Carlos Mendoza', description: 'Cabello suelto', type: 'Leve' },
        ];
        status = 'Proceso';
      } else {
        reason = 'Bajo rendimiento académico persistente';
        type = 'Académica';
        incidentHistory = [
          { date: '05/04/2026', time: '11:00', reportedBy: tutor?.name || 'Tutor', description: 'No presentó el proyecto bimestral de Matemáticas', type: 'Académica' },
          { date: '12/04/2026', time: '09:30', reportedBy: tutor?.name || 'Tutor', description: 'Nota desaprobatoria (08/20) en examen parcial', type: 'Académica' },
        ];
        status = 'Pendiente';
      }

      return {
        id: student.id,
        student,
        reason,
        type,
        status,
        scheduledDate: status !== 'Pendiente' ? '2026-04-20' : '',
        scheduledTime: status !== 'Pendiente' ? '15:30' : '',
        parentConfirmed: idx === 3 ? true : false,
        incidentHistory
      };
    });
  });

  const [activeTab, setActiveTab] = useState<'Pendiente' | 'Proceso' | 'Confirmada'>('Pendiente');
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: '', time: '', notes: '', customMessage: '' });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    category: 'Académico' as 'Académico' | 'Incidencias',
    studentId: '',
    type: 'Académica',
    course: 'Matemáticas',
    reason: ''
  });

  const handleScheduleClick = (citation: any) => {
    if (schedulingFor === citation.id) {
      setSchedulingFor(null);
    } else {
      setSchedulingFor(citation.id);
      setFormData({
        date: '', 
        time: '', 
        notes: '',
        customMessage: `¡Hola! Somos del Área de Convivencia.\n\nEstimado apoderado de ${citation.student.name}, se le cita a una reunón personal en el colegio el día [Seleccione fecha] a las [Hora] con el docente ${tutor?.name || 'Tutor'}.\n\n📌 Motivo de citación: ${citation.reason}.\nSu asistencia es de carácter obligatorio.`
      });
    }
  };
  const handleCreateCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.studentId || !createData.reason) return;
    
    const studentInfo = students.find(s => s.id === createData.studentId);
    if (!studentInfo) return;

    const newCitation = {
      id: `cit-${Date.now()}`,
      student: studentInfo,
      reason: createData.category === 'Académico' ? `Alerta Académica (${createData.course}): ${createData.reason}` : createData.reason,
      type: createData.category === 'Académico' ? 'Académica' : (createData.type as 'Leve' | 'Moderada' | 'Grave' | 'Académica'),
      status: 'Pendiente' as const,
      scheduledDate: '',
      scheduledTime: '',
      parentConfirmed: false,
      incidentHistory: [
        {
          date: new Date().toLocaleDateString('es-PE'),
          time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          reportedBy: tutor?.name || 'Tutor',
          description: createData.reason,
          type: createData.category === 'Académico' ? 'Académica' : createData.type
        }
      ]
    };
    
    setCitations(prev => [newCitation, ...prev]);
    setShowCreateModal(false);
    setCreateData({ category: 'Académico', studentId: '', type: 'Académica', course: 'Matemáticas', reason: '' });
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingFor) return;

    setCitations(prev => prev.map(c => 
      c.id === schedulingFor 
        ? { ...c, status: 'Proceso', scheduledDate: formData.date, scheduledTime: formData.time }
        : c
    ));
    setSchedulingFor(null);
    setFormData({ date: '', time: '', notes: '' });
    // Simulate WhatsApp send
    alert('Citación programada y enviada al WhatsApp del apoderado correctamente.');
  };

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/50">
          
          <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 w-fit">
                  <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                    {classroom.level}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                    {classroom.grade}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{classroom.section}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400">
                    <Mail className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Citaciones y Reuniones
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                      Bandeja de gestión y notificaciones para padres de familia
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  Nueva Citación
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 bg-slate-100 p-1.5 flex items-center justify-between rounded-2xl w-full flex-nowrap overflow-x-auto dark:bg-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('Pendiente')}
              className={`flex-1 flex justify-center items-center gap-2 px-5 py-2.5 text-sm font-bold min-w-max rounded-xl transition-all ${
                activeTab === 'Pendiente'
                  ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Pendientes
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === 'Pendiente' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                {citations.filter(c => c.status === 'Pendiente').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('Proceso')}
              className={`flex-1 flex justify-center items-center gap-2 px-5 py-2.5 text-sm font-bold min-w-max rounded-xl transition-all ${
                activeTab === 'Proceso'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              En Proceso
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === 'Proceso' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                {citations.filter(c => c.status === 'Proceso').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('Confirmada')}
              className={`flex-1 flex justify-center items-center gap-2 px-5 py-2.5 text-sm font-bold min-w-max rounded-xl transition-all ${
                activeTab === 'Confirmada'
                  ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmadas
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === 'Confirmada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                {citations.filter(c => c.status === 'Confirmada').length}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {citations.filter(c => c.status === activeTab).length === 0 ? (
              <div className="text-center py-12 text-slate-500">No hay citaciones {activeTab === 'Pendiente' ? 'pendientes' : activeTab === 'Proceso' ? 'en proceso' : 'confirmadas'} para este salón.</div>
            ) : citations.filter(c => c.status === activeTab).map(citation => (
              <div key={citation.id} className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-sm transition-all duration-300 ${schedulingFor === citation.id ? 'border-indigo-300 dark:border-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${citation.student.avatarColor}`}>
                      {citation.student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{citation.student.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          citation.type === 'Grave' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                          citation.type === 'Moderada' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                          citation.type === 'Académica' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                        }`}>
                          {citation.type === 'Académica' ? 'ACADÉMICO' : 'DISCIPLINA'}: {citation.reason}
                        </span>
                        {citation.status !== 'Pendiente' && (
                          <span className={`flex items-center gap-1 text-xs font-medium ${citation.status === 'Confirmada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {citation.status === 'Confirmada' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />} 
                            {citation.status === 'Confirmada' ? 'Confirmada para el' : 'En proceso para el'} {citation.scheduledDate} a las {citation.scheduledTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {citation.status === 'Pendiente' ? (
                      <button 
                        onClick={() => handleScheduleClick(citation)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2"
                      >
                        <CalendarDays className="w-4 h-4" />
                        {schedulingFor === citation.id ? 'Cerrar' : 'Revisar y Agendar'}
                      </button>
                    ) : citation.status === 'Proceso' ? (
                      <div className="flex items-center gap-2">
                        {!citation.parentConfirmed ? (
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <Clock className="w-4 h-4 animate-pulse" />
                              Esperando al padre...
                            </span>
                            <button 
                              onClick={() => setCitations(prev => prev.map(c => c.id === citation.id ? { ...c, parentConfirmed: true } : c))}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-xs rounded hover:bg-blue-100 transition-colors"
                              title="Botón de prueba para simular que el padre aceptó por WhatsApp"
                            >
                              Simular Respuesta
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                              <CheckCircle2 className="w-4 h-4" />
                              Padre Confirmó
                            </span>
                            <button 
                              onClick={() => setCitations(prev => prev.map(c => c.id === citation.id ? { ...c, status: 'Confirmada' } : c))}
                              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                              <Check className="w-4 h-4" /> Aprobar y Cerrar
                            </button>
                            <button 
                              onClick={() => setSchedulingFor(schedulingFor === citation.id ? null : citation.id)}
                              className="px-4 py-2 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                              <CalendarDays className="w-4 h-4" />
                              {schedulingFor === citation.id ? 'Cerrar' : 'Reagendar'}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSchedulingFor(schedulingFor === citation.id ? null : citation.id)}
                        className="px-4 py-2 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {schedulingFor === citation.id ? 'Cerrar' : 'Ver Detalles'}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {schedulingFor === citation.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Evidencia Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800 dark:text-white">Evidencia Registrada</h4>
                          </div>
                          
                          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-5 pb-4">
                            {citation.incidentHistory.map((inc, i) => (
                              <div key={i} className="relative pl-6">
                                <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                                  inc.type === 'Grave' ? 'bg-rose-500' :
                                  inc.type === 'Moderada' ? 'bg-amber-500' :
                                  inc.type === 'Académica' ? 'bg-blue-500' :
                                  'bg-slate-400'
                                }`} />
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-shadow">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">{inc.description}</p>
                                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{inc.date}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{inc.time}</span>
                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{inc.reportedBy}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scheduling Form Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <CalendarDays className="w-4 h-4" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800 dark:text-white">
                              {citation.status === 'Confirmada' ? 'Detalles de la Reunión' : 'Programar Reunión'}
                            </h4>
                          </div>

                          <form onSubmit={handleSchedule} className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fecha</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <CalendarDays className="w-4 h-4" />
                                  </div>
                                  <input 
                                    type="date" 
                                    required
                                    disabled={citation.status === 'Confirmada'}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                                    value={citation.status === 'Pendiente' ? formData.date : citation.scheduledDate}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Hora</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <input 
                                    type="time" 
                                    required
                                    disabled={citation.status === 'Confirmada'}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                                    value={citation.status === 'Pendiente' ? formData.time : citation.scheduledTime}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-6">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Docente a cargo</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                  <User className="w-4 h-4" />
                                </div>
                                <input 
                                  type="text" 
                                  disabled
                                  value={tutor ? tutor.name : 'Tutor asignado'}
                                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed"
                                />
                              </div>
                            </div>
                            
                            {citation.status !== 'Confirmada' && (
                              <div className="mt-2 bg-[#e1ffd4] dark:bg-[#054c44] rounded-b-2xl rounded-tr-2xl rounded-tl-sm border border-[#c6efb4] dark:border-[#0a6c60] mb-6 relative shadow-sm overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between bg-[#c6efb4] dark:bg-[#086156] px-4 py-2 border-b border-[#aee297] dark:border-[#0b7a6c]">
                                  <div className="flex items-center gap-2 text-[#0b5c46] dark:text-[#a0f0d4] font-bold text-sm">
                                    <MessageCircle className="w-4 h-4" /> Notificación a enviar (Editable)
                                  </div>
                                </div>
                                <textarea
                                  className="w-full h-32 p-4 text-sm text-[#11271e] dark:text-[#d1f4e5] bg-transparent resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-[#0b5c46]/30 dark:focus:ring-[#a0f0d4]/30"
                                  value={formData.customMessage}
                                  onChange={e => setFormData({ ...formData, customMessage: e.target.value })}
                                />
                                <div className="px-4 pb-3 flex justify-between items-center text-[10px] text-[#0b5c46]/60 dark:text-[#a0f0d4]/60 font-bold uppercase tracking-wider">
                                  <span>Plantilla automática</span>
                                  <span>{formData.customMessage?.length || 0} caracteres</span>
                                </div>
                              </div>
                            )}

                            {citation.status !== 'Confirmada' && (
                              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <button 
                                  type="button"
                                  onClick={() => setSchedulingFor(null)}
                                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button 
                                  type="submit"
                                  className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Agendar y Notificar Padre
                                </button>
                              </div>
                            )}
                          </form>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Create Citation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nueva Citación</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Genera una alerta para coordinar reunión.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCitation} className="p-6 space-y-5">
                {/* Category Selection Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setCreateData({ ...createData, category: 'Académico', type: 'Académica' })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${createData.category === 'Académico' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    Tema Académico
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateData({ ...createData, category: 'Incidencias', type: 'Moderada' })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${createData.category === 'Incidencias' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    Por Incidencias
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estudiante a Citar</label>
                  <select 
                    required
                    value={createData.studentId}
                    onChange={e => setCreateData({...createData, studentId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione un estudiante</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.dni})</option>
                    ))}
                  </select>
                </div>

                {createData.category === 'Académico' ? (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Curso Afectado</label>
                    <select 
                      required
                      value={createData.course}
                      onChange={e => setCreateData({...createData, course: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Matemáticas">Matemáticas</option>
                      <option value="Comunicación">Comunicación</option>
                      <option value="Ciencias">Ciencias</option>
                      <option value="Personal Social">Personal Social</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gravedad de Incidencia</label>
                    <select 
                      required
                      value={createData.type}
                      onChange={e => setCreateData({...createData, type: e.target.value as 'Leve' | 'Moderada' | 'Grave'})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Grave">Grave (Defrente)</option>
                      <option value="Moderada">Moderada</option>
                      <option value="Leve">Leve</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Motivo Detallado de Citación</label>
                  <textarea 
                    required
                    rows={3}
                    value={createData.reason}
                    onChange={e => setCreateData({...createData, reason: e.target.value})}
                    placeholder={createData.category === 'Académico' ? "Ej. Bajo rendimiento constante, desaprobatoria en 2 bimestres..." : "Ej. Indisciplina constante en clase, falta de respeto..."}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Crear Citación (Pendiente)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VirtualAttendance: React.FC<{
  classroom: { level: string, grade: string, section: string },
  students: UserItem[],
  onBack: () => void
}> = ({ classroom, students, onBack }) => {
  const [attendanceState, setAttendanceState] = useState<Record<string, 'presente' | 'tardanza' | 'falta'>>({});

  const handleMark = (studentId: string, status: 'presente' | 'tardanza' | 'falta') => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    // Simulate saving
    alert('Asistencia virtual registrada correctamente.');
    onBack();
  };

  const currentDate = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full relative">
        <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/50">
          
          <div className="bg-[#f0f4f8] dark:bg-slate-800/50 rounded-t-2xl p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 w-fit">
                  <button onClick={onBack} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                    {classroom.level}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                    {classroom.grade}
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{classroom.section}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-[20px] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-cyan-400">
                    <MonitorPlay className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Asistencia Virtual
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium capitalize mt-1">
                      {currentDate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Registrar
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16 text-center">#</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estudiante</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student, index) => {
                    const status = attendanceState[student.id];
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4 text-center text-slate-400 dark:text-slate-500 font-mono text-sm font-medium">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${student.avatarColor}`}>
                              {student.name.charAt(0)}
                            </div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleMark(student.id, 'presente')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${status === 'presente' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title="Presente"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleMark(student.id, 'tardanza')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${status === 'tardanza' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-50 text-slate-400 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title="Tardanza"
                            >
                              <Clock className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleMark(student.id, 'falta')}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${status === 'falta' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-50 text-slate-400 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title="Falta"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
