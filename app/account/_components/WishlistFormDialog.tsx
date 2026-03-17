"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { wishlistFormSchema, type WishlistFormValues } from "@/validations";

type WishlistFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WishlistFormValues) => Promise<void> | void;
  defaultValues?: Partial<WishlistFormValues>;
  mode?: "create" | "edit";
};

const FALLBACK_VALUES: WishlistFormValues = {
  name: "",
  description: "",
  isPrivate: false,
  color: "#e8734a",
};

export function WishlistFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = "create",
}: WishlistFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(wishlistFormSchema),
    defaultValues: {
      ...FALLBACK_VALUES,
      ...defaultValues,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  useEffect(() => {
    if (open) {
      reset({
        ...FALLBACK_VALUES,
        ...defaultValues,
      });
      setFormError(null);
    }
  }, [open, defaultValues, reset]);

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({
        ...FALLBACK_VALUES,
        ...defaultValues,
      });
      setFormError(null);
    }

    onOpenChange(nextOpen);
  };

  const handleFormSubmit = async (values: WishlistFormValues) => {
    try {
      setFormError(null);
      setIsSubmitting(true);

      await onSubmit({
        ...values,
        name: values.name.trim(),
        description: values.description?.trim() || "",
        color: values.color.trim(),
      });

      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "edit" ? "Edit wishlist" : "Create wishlist";
  const description =
    mode === "edit"
      ? "Update your wishlist details and preferences."
      : "Create a new wishlist to save trips, experiences, or transport options.";

  const submitLabel =
    mode === "edit"
      ? isSubmitting
        ? "Saving..."
        : "Save changes"
      : isSubmitting
        ? "Creating..."
        : "Create wishlist";

  const SubmitIcon = mode === "edit" ? Save : Plus;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wishlist name</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer in Egypt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Places and experiences I want to book later..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-xl border p-4">
                    <div className="space-y-1">
                      <FormLabel className="flex items-center gap-2">
                        <Lock size={14} />
                        Private wishlist
                      </FormLabel>
                      <FormDescription>
                        Only you can see this wishlist.
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme color</FormLabel>

                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input
                          type="color"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-11 w-16 cursor-pointer p-1"
                        />
                      </FormControl>

                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="#e8734a"
                        className="font-mono"
                      />
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {formError ? (
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            ) : null}

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={isSubmitting || (mode === "edit" && !isDirty)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {submitLabel}
                  </>
                ) : (
                  <>
                    <SubmitIcon size={16} />
                    {submitLabel}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
