import * as React from "react";
import { cn } from "@/lib/utils";

const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fixed bottom-4 right-4 z-50 rounded-lg border bg-background p-4 shadow-lg", className)} {...props} />
  )
);
Toast.displayName = "Toast";

const ToastProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props} />
  )
);
ToastViewport.displayName = "ToastViewport";

export { Toast, ToastProvider, ToastViewport };
