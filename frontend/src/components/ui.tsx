import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="inline-flex rounded-md border-2 border-slate-950 bg-cyan-300 px-2 py-1 text-xs font-black uppercase text-slate-950 shadow-[3px_3px_0_#0f1028]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-3xl font-black uppercase leading-none text-white drop-shadow-[3px_3px_0_#0f1028] sm:text-4xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`party-card p-4 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border-4 border-dashed border-slate-950 bg-white px-4 py-8 text-center shadow-[6px_6px_0_#0f1028]">
      <p className="text-lg font-black uppercase text-slate-950">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{body}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="party-card px-4 py-5 text-sm font-black uppercase text-slate-700">
      {label}
    </div>
  );
}

export function ErrorState({ label }: { label: string }) {
  return (
    <div className="rounded-md border-4 border-slate-950 bg-[#ff4f8b] px-4 py-5 text-sm font-black uppercase text-white shadow-[6px_6px_0_#0f1028]">
      {label}
    </div>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
