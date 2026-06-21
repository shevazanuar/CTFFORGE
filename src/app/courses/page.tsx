'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BookOpen, Award, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
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
  isPublished: boolean;
  modules: Module[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses);
          setCompletedLessons(data.completedLessonIds || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const getCourseStats = (course: Course) => {
    let total = 0;
    let completed = 0;
    
    course.modules.forEach(mod => {
      mod.lessons.forEach(les => {
        total++;
        if (completedLessons.includes(les.id)) {
          completed++;
        }
      });
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-cyber-blue glow-blue" />
            Learning Pathways
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 font-mono">
            Kurikulum terstruktur untuk memahami teori dasar cybersecurity sebelum melakukan uji coba lab praktis.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyber-blue"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => {
              const { total, completed, percentage } = getCourseStats(course);
              return (
                <div
                  key={course.id}
                  className="cyber-panel p-6 rounded-2xl border border-purple-500/15 flex flex-col justify-between"
                >
                  <div>
                    {/* Level badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                        course.level === 'BEGINNER' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' : 
                        course.level === 'INTERMEDIATE' ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' : 
                        'bg-cyber-red/10 text-cyber-red border border-cyber-red/20'
                      }`}>
                        {course.level}
                      </span>
                      {percentage === 100 && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-green font-bold bg-cyber-green/10 px-2 py-0.5 rounded border border-cyber-green/20">
                          <CheckCircle2 className="h-3 w-3" />
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <h2 className="font-mono text-xl font-bold text-white mb-2">{course.title}</h2>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">{course.description}</p>

                    {/* Progress details */}
                    <div className="mb-6 font-mono text-xs">
                      <div className="flex justify-between text-gray-500 mb-1.5">
                        <span>Progress Kurikulum</span>
                        <span>{completed} / {total} Pelajaran ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 border border-zinc-900 overflow-hidden">
                        <div
                          className="bg-cyber-blue h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Modules breakdown list */}
                    <div className="space-y-2 mb-6">
                      <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Daftar Modul ({course.modules.length})</h4>
                      <div className="space-y-1">
                        {course.modules.map(mod => (
                          <div
                            key={mod.id}
                            className="flex justify-between items-center text-xs font-mono p-2 bg-zinc-950/60 rounded border border-zinc-900"
                          >
                            <span className="text-gray-300 truncate max-w-[200px] sm:max-w-xs">{mod.title}</span>
                            <span className="text-gray-500 text-[10px] flex-shrink-0">{mod.lessons.length} lessons</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <Link
                    href={`/courses/${course.id}`}
                    className="w-full text-center py-2.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-purple-500/40 hover:border-cyber-green/50 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 text-cyber-green fill-cyber-green" />
                    {completed > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-sm font-mono text-gray-500">
            Belum ada materi course yang dipublikasikan.
          </div>
        )}
      </main>
    </div>
  );
}
