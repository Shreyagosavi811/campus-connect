import { motion } from "framer-motion";

export function NoticeSkeleton() {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3 flex-1">
          <div className="h-8 bg-slate-100 rounded-xl w-3/4" />
          <div className="h-4 bg-slate-50 rounded-lg w-1/4" />
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
      </div>
      <div className="space-y-2 mb-8">
        <div className="h-4 bg-slate-50 rounded-lg w-full" />
        <div className="h-4 bg-slate-50 rounded-lg w-5/6" />
        <div className="h-4 bg-slate-50 rounded-lg w-4/6" />
      </div>
      <div className="h-64 bg-slate-100 rounded-[2rem] w-full" />
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse">
       <div className="h-48 bg-slate-100 rounded-[2rem] mb-6" />
       <div className="h-6 bg-slate-100 rounded-lg w-3/4 mb-4" />
       <div className="space-y-2 mb-6">
          <div className="h-3 bg-slate-50 rounded-lg w-full" />
          <div className="h-3 bg-slate-50 rounded-lg w-2/3" />
       </div>
       <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded-xl w-24" />
          <div className="h-8 bg-slate-100 rounded-xl w-24" />
       </div>
    </div>
  );
}
