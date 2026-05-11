import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, LucideIcon, Plus, Trash2, X } from "lucide-react";
import { ReactNode, useState } from "react";

type DynamicCollectionPanelProps<T> = {
  title: string;
  subtitle?: string;
  fields: any[];
  append: (v: T) => void;
  remove: (i: number) => void;
  createItem: (index: number) => T;
  renderItem: (params: {
    field: any;
    index: number;
    isEditing: boolean;
    onEdit: () => void;
    onRemove: () => void;
  }) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  addLabel: (nextIndex: number) => string;
  icon: ReactNode;
  badgeIcon?: ReactNode;
  infoBox?: ReactNode;
  maxItems?: number;
  onClearAll?: () => void;
  addButtonClassName?: string;
  badgeClassName?: string;
};

export const styles: Record<
  "indigo" | "amber" | "orange",
  {
    active: string;
    inactive: string;
    ring: string;
  }
> = {
  indigo: {
    active:
      "border-indigo-500/30 bg-indigo-500 text-white shadow-indigo-500/25",
    inactive:
      "border-indigo-200/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/[0.06] hover:border-indigo-300/60 dark:hover:border-indigo-700/50",
    ring: "focus-visible:ring-indigo-400/40",
  },

  amber: {
    active: "border-amber-500/30 bg-amber-500 text-white shadow-amber-500/25",
    inactive:
      "border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/[0.06] hover:border-amber-300/60 dark:hover:border-amber-700/50",
    ring: "focus-visible:ring-amber-400/40",
  },

  orange: {
    active:
      "border-orange-500/30 bg-orange-500 text-white shadow-orange-500/25",
    inactive:
      "border-orange-200/60 dark:border-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-500/[0.06] hover:border-orange-300/60 dark:hover:border-orange-700/50",
    ring: "focus-visible:ring-orange-400/40",
  },
};

const sectionThemes = {
  indigo: {
    border: "border-indigo-500/20",
    hover: "hover:bg-indigo-500/5",
    iconBg: "bg-indigo-500/10",
    icon: "text-indigo-500",
    badge:
      "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    accent: "from-indigo-500/10 via-indigo-500/5 to-transparent",
  },

  orange: {
    border: "border-orange-500/20",
    hover: "hover:bg-orange-500/5",
    iconBg: "bg-orange-500/10",
    icon: "text-orange-500",
    badge:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-300",
    accent: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
};

const badgeThemes = {
  indigo:
    "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/15",

  orange:
    "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-300 hover:bg-orange-500/15",
};

export function Section({
  icon: Icon,
  label,
  children,
  defaultOpen = true,
  badge,
  sublabel,
  theme = "indigo",
}: {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  sublabel?: string;
  theme?: keyof typeof sectionThemes;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const styles = sectionThemes[theme];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card/70 backdrop-blur-sm",
        "transition-all duration-300 shadow-sm hover:shadow-sm",
        open ? cn(styles.border, "bg-card") : "border-border/60",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-linear-to-r opacity-0 transition-opacity duration-300",
          styles.accent,
          open && "opacity-100",
        )}
      />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex w-full items-center gap-4 px-5 py-4 text-left transition-all duration-200",
          styles.hover,
          open && "border-b border-border/50",
        )}
      >
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
              open ? styles.iconBg : "bg-muted",
            )}
          >
            <Icon
              className={cn(
                "h-4.5 w-4.5 transition-colors duration-300",
                open ? styles.icon : "text-muted-foreground",
              )}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate text-sm font-semibold tracking-tight transition-colors",
                open ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </p>

            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "h-5 rounded-md px-2 text-[10px] font-medium tracking-wide",
                  styles.badge,
                )}
              >
                {badge}
              </Badge>
            )}
          </div>

          {sublabel && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {sublabel}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
            open && "bg-background/80",
          )}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function TagListField({
  values,
  onChange,
  placeholder,
  theme,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  theme: "orange" | "indigo";
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const t = draft.trim();
    if (!t) return;
    onChange([...values, t]);
    setDraft("");
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="text-sm flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="gap-1 h-9 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <Badge
              key={i}
              variant="secondary"
              className={cn(
                "gap-1.5 border pl-2.5 pr-1.5 py-1 text-sm transition-colors",
                badgeThemes[theme],
              )}
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function DynamicCollectionPanel<T>({
  title,
  subtitle,
  fields,
  append,
  remove,
  createItem,
  renderItem,
  emptyTitle,
  emptyDescription,
  addLabel,
  icon,
  badgeIcon,
  infoBox,
  maxItems,
  onClearAll,
  addButtonClassName,
  badgeClassName,
}: DynamicCollectionPanelProps<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(true);

  const total = fields.length;
  const hasItems = total > 0;
  const isMaxReached = typeof maxItems === "number" ? total >= maxItems : false;

  const addItem = () => {
    if (isMaxReached) return;
    const index = total;

    append(createItem(index));
    setEditingIndex(index);
    setOpen(true);
  };

  const toggleEdit = (index: number) => {
    setOpen(true);
    setEditingIndex((prev) => (prev === index ? null : index));
  };

  const handleRemove = (index: number) => {
    remove(index);
    setEditingIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>

              <p className="text-xs text-muted-foreground">
                {hasItems ? `${total} item${total !== 1 ? "s" : ""}` : subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasItems && (
              <Badge
                variant="secondary"
                className={cn("gap-1 text-xs", badgeClassName)}
              >
                {badgeIcon}
                {total}
              </Badge>
            )}

            <button
              type="button"
              onClick={addItem}
              disabled={isMaxReached}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border bg-background transition-colors",
                isMaxReached
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-muted",
              )}
            >
              <Plus className="h-4 w-4" />
            </button>

            {onClearAll && hasItems && (
              <button
                type="button"
                onClick={onClearAll}
                className="size-8 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}

            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="space-y-3 p-4">
            {infoBox}

            {!hasItems ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-card/40">
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    {badgeIcon}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{emptyTitle}</p>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {emptyDescription}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) =>
                  renderItem({
                    field,
                    index,
                    isEditing: editingIndex === index,
                    onEdit: () => toggleEdit(index),
                    onRemove: () => handleRemove(index),
                  }),
                )}
              </div>
            )}

            <button
              type="button"
              onClick={addItem}
              disabled={isMaxReached}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 transition-all",
                addButtonClassName,
                isMaxReached && "opacity-40 cursor-not-allowed",
              )}
            >
              <Plus className="size-4" />

              <span className="text-sm font-medium">{addLabel(total + 1)}</span>
            </button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
