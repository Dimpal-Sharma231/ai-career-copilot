import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/[0.05] rounded-xl ${className}`}></div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8 max-w-7xl mx-auto">
    {/* Hero Banner Skeleton */}
    <div className="rounded-3xl p-8 bg-white/[0.02] border border-white/5 space-y-4">
      <Skeleton className="h-6 w-48 rounded-full" />
      <Skeleton className="h-10 w-3/4 max-w-xl" />
      <Skeleton className="h-4 w-1/2 max-w-md" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-11 w-44 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
    </div>

    {/* Stat Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>

    {/* DSA Widget Skeleton */}
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>

    {/* Pipeline Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <Skeleton className="h-6 w-48 mb-4" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  </div>
);

export const ResumeSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-16 w-28" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
    <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="flex flex-wrap gap-2 pt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl mt-4" />
    </div>
  </div>
);

export const MatcherSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-20" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-28 w-28 rounded-full" />
    </div>
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  </div>
);
