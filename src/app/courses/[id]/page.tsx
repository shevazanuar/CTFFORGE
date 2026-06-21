'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, CheckSquare, Square, ChevronLeft, ArrowRight, Target, Award, CheckCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  point: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  orderIndex: number;
  challenges: Challenge[];
}

interface Module {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  modules: Module[];
}

export default function CourseDetailsPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { refetchUser } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          const foundCourse = data.courses.find((c: any) => c.id === courseId);
          if (foundCourse) {
            setCourse(foundCourse);
            setCompletedLessons(data.completedLessonIds || []);
            
            // Set default selected lesson to the first lesson in the first module
            if (foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
              setSelectedLesson(foundCourse.modules[0].lessons[0]);
            }
          } else {
            router.push('/courses');
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId]);

  const handleToggleComplete = async (lessonId: string, currentStatus: boolean) => {
    if (updatingProgress) return;
    setUpdatingProgress(true);

    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update local progress state
        if (!currentStatus) {
          setCompletedLessons([...completedLessons, lessonId]);
        } else {
          setCompletedLessons(completedLessons.filter(id => id !== lessonId));
        }

        // Trigger global refetch to update badges/points
        await refetchUser();

        // Show congrats if badge was awarded
        if (data.badgeAwarded) {
          alert(`🏆 SELAMAT! Anda memperoleh lencana baru: "${data.badgeAwarded.name}" - ${data.badgeAwarded.description}`);
        }
      }
    } catch (err) {
      console.error('Error toggling progress:', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Helper to render markdown content beautifully
  const renderContent = (content: string) => {
    // Simple custom parser to transform headings, lists, code blocks, and bold texts
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-mono font-bold text-white mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-sm font-mono font-bold text-cyber-blue mt-4 mb-2">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 my-2 pl-4 text-sm text-gray-300 font-mono">
            <li>{line.replace('- ', '')}</li>
          </ul>
        );
      }
      if (line.startsWith('1. ')) {
        return (
          <ol key={idx} className="list-decimal list-inside space-y-1 my-2 pl-4 text-sm text-gray-300 font-mono">
            <li>{line.replace(/\d+\. /, '')}</li>
          </ol>
        );
      }
      if (line.startsWith('```')) {
        // We'll skip rendering raw block markers
        if (line === '```' || line.startsWith('```')) return null;
      }
      // Simple inline code and bold mappings
      const cleanLine = line
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-cyber-green text-xs border border-zinc-900">$1</code>');

      // Check if inside code block (we detect based on code styles or surrounding text)
      const isSql = line.trim().startsWith('SELECT') || line.trim().startsWith('db.execute') || line.trim().startsWith('const user');
      
      if (isSql) {
        return (
          <pre key={idx} className="bg-zinc-950 p-4 rounded-lg my-3 border border-zinc-900 font-mono text-xs text-cyber-green overflow-x-auto">
            <code>{line}</code>
          </pre>
        );
      }

      if (line.trim() === '') return <div key={idx} className="h-4"></div>;

      return (
        <p
          key={idx}
          className="text-sm text-gray-300 leading-relaxed font-mono my-2.5"
          dangerouslySetInnerHTML={{ __html: cleanLine }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyber-blue"></div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-8">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1 flex flex-col">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Pathways
          </Link>
        </div>

        {/* Course Main Title Header */}
        <div className="mb-6 p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-mono font-bold text-white">{course.title}</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Level: <span className="text-cyber-blue font-bold">{course.level}</span></p>
          </div>
          <BookOpen className="h-6 w-6 text-cyber-blue" />
        </div>

        {/* Side-by-Side Learning Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          
          {/* LEFT PANEL: Course Modules Outline */}
          <div className="lg:col-span-4 space-y-4">
            <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[70vh] overflow-y-auto">
              <h2 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Daftar Pelajaran
              </h2>
              
              <div className="space-y-4">
                {course.modules.map((mod) => (
                  <div key={mod.id} className="space-y-1.5">
                    <h3 className="font-mono text-xs font-bold text-white border-b border-zinc-800 pb-1.5 truncate">
                      {mod.title}
                    </h3>
                    <div className="space-y-1">
                      {mod.lessons.map((les) => {
                        const isDone = completedLessons.includes(les.id);
                        const isSelected = selectedLesson?.id === les.id;
                        return (
                          <button
                            key={les.id}
                            onClick={() => setSelectedLesson(les)}
                            className={`w-full text-left flex items-center justify-between p-2.5 rounded text-xs font-mono transition-all border ${
                              isSelected
                                ? 'bg-purple-500/10 text-cyber-green border-purple-500/35 glow-green'
                                : 'bg-zinc-950/30 text-gray-400 hover:text-white border-transparent hover:bg-zinc-900/60'
                            }`}
                          >
                            <span className="truncate max-w-[200px] sm:max-w-xs">{les.title}</span>
                            {isDone ? (
                              <CheckCircle className="h-4 w-4 text-cyber-green flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-zinc-800 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Selected Lesson Content Reader */}
          <div className="lg:col-span-8 flex flex-col h-full">
            {selectedLesson ? (
              <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 flex-1 flex flex-col justify-between">
                
                {/* Lesson Text Content */}
                <div>
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
                    <h2 className="font-mono text-xl font-bold text-white">{selectedLesson.title}</h2>
                    <span className="text-[10px] font-mono text-gray-500">Pelajaran ke-{selectedLesson.orderIndex}</span>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    {renderContent(selectedLesson.content)}
                  </div>
                </div>

                {/* Lesson Footer Controls */}
                <div className="border-t border-zinc-900 pt-6 mt-12 flex flex-col gap-6">
                  {/* Related Challenge Link Card */}
                  {selectedLesson.challenges && selectedLesson.challenges.length > 0 && (
                    <div className="p-4 rounded-xl bg-cyber-green/5 border border-cyber-green/20 flex justify-between items-center group">
                      <div>
                        <div className="flex items-center gap-1.5 text-cyber-green font-mono text-xs font-bold mb-1">
                          <Target className="h-4 w-4 animate-pulse" />
                          TANTANGAN CTF TERKAIT
                        </div>
                        <h4 className="font-mono text-sm font-bold text-white group-hover:text-cyber-green transition-colors">
                          {selectedLesson.challenges[0].title}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Selesaikan lab ini untuk mendapatkan +{selectedLesson.challenges[0].point} Poin</p>
                      </div>
                      <Link
                        href={`/challenges?id=${selectedLesson.challenges[0].id}`}
                        className="px-4 py-2 rounded bg-cyber-green hover:bg-cyber-green-dim text-cyber-bg font-mono text-xs font-bold transition-all flex items-center gap-1 hover:scale-105"
                      >
                        Mulai Lab
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* Completion Action */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500">Selesai membaca? Tandai progress Anda.</span>
                    <button
                      onClick={() => handleToggleComplete(selectedLesson.id, completedLessons.includes(selectedLesson.id))}
                      disabled={updatingProgress}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        completedLessons.includes(selectedLesson.id)
                          ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/20'
                          : 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/40'
                      }`}
                    >
                      {completedLessons.includes(selectedLesson.id) ? (
                        <>
                          <CheckSquare className="h-4 w-4" />
                          <span>Pelajaran Selesai (Klik Batal)</span>
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4" />
                          <span>Tandai Selesai & Lanjut</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 flex-1 flex justify-center items-center text-gray-500 font-mono text-xs">
                Pilih pelajaran di bilah sisi kiri untuk memulai.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
