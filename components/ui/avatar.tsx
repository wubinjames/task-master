import * as React from "react";

export function Avatar({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={
        "inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold " +
        (className || "")
      }
      style={{ width: 32, height: 32 }}
    >
      {children}
    </span>
  );
}

export function AvatarFallback({ children }: React.PropsWithChildren<{}>) {
  return <span>{children}</span>;
} 