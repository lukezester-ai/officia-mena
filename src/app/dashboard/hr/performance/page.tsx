'use client';

import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Plus, Search, CheckCircle2 } from 'lucide-react';

type PerformanceReview = {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  overallRating: number;
  productivity: number;
  teamwork: number;
  communication: number;
  attendance: number;
  status: 'draft' | 'submitted' | 'reviewed';
  reviewer: string;
  notes: string;
};

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  useEffect(() => {
    // Mock data - replace with API call
    setReviews([
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'أحمد عبدالله',
        reviewPeriod: 'Q4 2023',
        overallRating: 4.5,
        productivity: 4,
        teamwork: 5,
        communication: 4,
        attendance: 5,
        status: 'reviewed',
        reviewer: 'المدير المالي',
        notes: 'أداء ممتاز مع نمو ملحوظ في الإنتاجية'
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: 'محمد علي',
        reviewPeriod: 'Q4 2023',
        overallRating: 3.8,
        productivity: 4,
        teamwork: 3,
        communication: 4,
        attendance: 4,
        status: 'submitted',
        reviewer: 'المدير المالي',
        notes: 'أداء جيد، يحتاج إلى تحسين في العمل الجماعي'
      }
    ]);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
            <CheckCircle2 size={12} />
            تمت المراجعة
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-xs font-bold text-blue-300">
            قيد المراجعة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-400/20 bg-zinc-400/10 px-2 py-1 text-xs font-bold text-zinc-300">
            مسودة
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
            <TrendingUp className="text-[var(--color-gold-600)]" size={32} />
            تقييم الأداء
          </h1>
          <p className="text-[var(--color-desert-600)]">تقييم أداء الموظفين ومتابعة التطور</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-desert-900)] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
        >
          <Plus size={18} />
          تقييم جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">متوسط التقييم العام</div>
          <div className="text-3xl font-black text-[var(--color-desert-900)]">4.2</div>
          <div className="flex gap-1 mt-2">{renderStars(4.2)}</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">التقييمات المكتملة</div>
          <div className="text-3xl font-black text-[var(--color-desert-900)]">15</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">هذا الربع</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">قيد المراجعة</div>
          <div className="text-3xl font-black text-amber-600">3</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">تنتظر الموافقة</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">تحسن الأداء</div>
          <div className="text-3xl font-black text-emerald-600">+12%</div>
          <div className="text-sm text-[var(--color-desert-500)] mt-2">مقارنة بالربع السابق</div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-desert-400)]" size={18} />
            <input 
              type="text" 
              placeholder="البحث باسم الموظف..." 
              className="w-full bg-white border border-[var(--color-desert-200)] rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-gold-500)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
              <tr>
                <th className="py-3 px-6 font-medium">الموظف</th>
                <th className="py-3 px-6 font-medium">فترة التقييم</th>
                <th className="py-3 px-6 font-medium">التقييم العام</th>
                <th className="py-3 px-6 font-medium">الإنتاجية</th>
                <th className="py-3 px-6 font-medium">العمل الجماعي</th>
                <th className="py-3 px-6 font-medium">التواصل</th>
                <th className="py-3 px-6 font-medium">الحضور</th>
                <th className="py-3 px-6 font-medium">الحالة</th>
                <th className="py-3 px-6 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--color-desert-500)]">جاري التحميل...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--color-desert-500)]">لا توجد تقييمات أداء</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[var(--color-desert-50)]/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{review.employeeName}</td>
                    <td className="py-4 px-6 font-mono">{review.reviewPeriod}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{review.overallRating}</span>
                        {renderStars(review.overallRating)}
                      </div>
                    </td>
                    <td className="py-4 px-6">{renderStars(review.productivity)}</td>
                    <td className="py-4 px-6">{renderStars(review.teamwork)}</td>
                    <td className="py-4 px-6">{renderStars(review.communication)}</td>
                    <td className="py-4 px-6">{renderStars(review.attendance)}</td>
                    <td className="py-4 px-6">{getStatusBadge(review.status)}</td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => setSelectedReview(review)}
                        className="text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)] font-bold"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl" dir="rtl">
            <div className="p-6 border-b border-[var(--color-desert-200)] bg-[var(--color-desert-50)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-desert-900)]">تفاصيل التقييم</h2>
              <button onClick={() => setSelectedReview(null)} className="text-[var(--color-desert-500)] hover:text-black">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--color-desert-600)] mb-1">الموظف</div>
                  <div className="font-bold text-[var(--color-desert-900)]">{selectedReview.employeeName}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-desert-600)] mb-1">فترة التقييم</div>
                  <div className="font-bold text-[var(--color-desert-900)]">{selectedReview.reviewPeriod}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-desert-700)]">الإنتاجية</span>
                  <div className="flex items-center gap-2">{renderStars(selectedReview.productivity)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-desert-700)]">العمل الجماعي</span>
                  <div className="flex items-center gap-2">{renderStars(selectedReview.teamwork)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-desert-700)]">التواصل</span>
                  <div className="flex items-center gap-2">{renderStars(selectedReview.communication)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-desert-700)]">الحضور</span>
                  <div className="flex items-center gap-2">{renderStars(selectedReview.attendance)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-[var(--color-desert-700)] mb-2">ملاحظات المراجع</div>
                <div className="text-[var(--color-desert-900)] bg-[var(--color-desert-50)] p-4 rounded-xl">
                  {selectedReview.notes}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-desert-200)]">
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 bg-[var(--color-desert-900)] hover:bg-black text-white font-bold py-3 rounded-xl"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
