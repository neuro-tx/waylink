import { Pagination } from "@/lib/all-types";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronDown, Loader } from "lucide-react";
import { ReactNode } from "react";

type ErrorStateProps = {
  icon?: ReactNode;
  title?: string;
  message?: string;
  buttonLabel?: string;
  onRetry?: () => void;
};

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
};
type ColorVars = "blue" | "orange" | "green";

export function ErrorState({
  icon,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  buttonLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center py-28 gap-3 border-2 border-dashed border-red-500/20 rounded-2xl"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/8 border border-red-500/20">
        {icon}
      </div>

      <p className="text-lg font-bold text-red-400">{title}</p>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {message}
      </p>

      {onRetry && (
        <motion.button
          type="button"
          onClick={onRetry}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/25 text-red-400 bg-red-500/8 text-sm font-semibold cursor-pointer hover:bg-red-500/14 transition-all"
        >
          {buttonLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center py-28 gap-3 border-2 border-dashed border-orange-3/25 rounded-2xl"
    >
      <motion.div
        className="w-15 h-15 rounded-xl flex items-center justify-center bg-orange-3/10 border border-orange-3/25"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {icon}
      </motion.div>

      <p className="text-xl font-bold">{title}</p>

      {message && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {message}
        </p>
      )}

      {action}
    </motion.div>
  );
}

const loaderVars = cva(
  "relative flex items-center gap-2.5 px-7 py-2.5 rounded-2xl border text-sm font-semibold overflow-hidden transition-all duration-200 cursor-pointer",
  {
    variants: {
      colors: {
        blue: "text-blue-10 border-blue-10/40 bg-blue-10/8 hover:bg-blue-10/14",
        orange:
          "text-orange-3 border-orange-3/40 bg-orange-3/8 hover:bg-orange-3/14",
        green:
          "text-green-1 border-green-1/40 bg-green-1/8 hover:bg-green-1/14",
      },
    },
    defaultVariants: {
      colors: "blue",
    },
  },
);

export const LoadMore = ({
  loading,
  onClick,
  pagination,
  label,
  color,
}: {
  loading: boolean;
  onClick: () => void;
  pagination: Pagination;
  label?: string;
  color?: ColorVars;
}) => {
  if (!pagination.hasNextPage) return null;

  const { page, totalPages } = pagination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 pt-8 pb-2"
    >
      <span className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <motion.button
        type="button"
        onClick={onClick}
        disabled={loading}
        whileHover={!loading ? { scale: 1.01, y: -1 } : undefined}
        whileTap={!loading ? { scale: 0.98 } : undefined}
        className={cn(
          loaderVars({ colors: color }),
          loading &&
            "text-muted-foreground border-border cursor-not-allowed pointer-events-none",
        )}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Loading…
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Load more {label}
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
