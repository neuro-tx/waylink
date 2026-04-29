"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createBookingAction,
  cancelBookingAction,
  rebookAction,
  type CreateBookingInput,
  confirmBookingAction,
  getBookingLocationAction,
  completeBookingAction,
} from "@/actions/booking.action";
import { getGoogleMapsUrl } from "@/lib/utils";
import { Role } from "@/lib/policies";

interface BookingState {
  isPending: boolean;
  error: string | null;
}

export function useBooking() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "create" | "cancel" | "rebook" | "confirm" | "viewMap" | "complete" | null
  >(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  function clearError() {
    setError(null);
  }

  async function create(
    input: CreateBookingInput,
    options?: {
      onSuccess?: (data: { bookingId: string; orderNumber: string }) => void;
      onError?: (error: string) => void;
    },
  ) {
    setPendingAction("create");
    setError(null);
    try {
      const result = await createBookingAction(input);

      if (!result.success) {
        setError(result.error);
        options?.onError?.(result.error);
        return;
      }

      options?.onSuccess?.(result.data);
    } finally {
      setPendingAction(null);
    }
  }

  async function cancel(
    bookingId: string,
    options?: {
      onSuccess?: () => void;
      onError?: (error: string) => void;
      role?: Role;
    },
  ) {
    setPendingAction("cancel");
    setPendingBookingId(bookingId);
    setError(null);
    try {
      const result = await cancelBookingAction(bookingId, options?.role);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        options?.onError?.(result.error);
        return;
      }

      toast.success("Booking cancelled successfully.");
      options?.onSuccess?.();
      router.refresh();
    } finally {
      setPendingAction(null);
      setPendingBookingId(null);
    }
  }

  async function rebook(
    originalBookingId: string,
    options?: {
      onSuccess?: (data: { bookingId: string; orderNumber: string }) => void;
      onError?: (error: string) => void;
    },
  ) {
    setPendingAction("rebook");
    setPendingBookingId(originalBookingId);
    setError(null);
    try {
      const result = await rebookAction(originalBookingId);

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        options?.onError?.(result.error);
        return;
      }

      toast.success(`Rebooked! New order ${result.data.orderNumber}`);
      options?.onSuccess?.(result.data);
      router.refresh();
    } finally {
      setPendingAction(null);
      setPendingBookingId(null);
    }
  }

  async function confirm(
    bookingId: string,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: string) => void;
    },
  ) {
    setPendingAction("confirm");
    setPendingBookingId(bookingId);
    try {
      const result = await confirmBookingAction(bookingId);

      if (!result.success) {
        toast.error(result.error);
        options?.onError?.(result.error);
        return;
      }

      toast.success("Booking confirmed!");
      options?.onSuccess?.(result.data);
      router.refresh();
    } finally {
      setPendingAction(null);
      setPendingBookingId(null);
    }
  }

  async function viewMap(bookingId: string) {
    setPendingAction("viewMap");
    setPendingBookingId(bookingId);
    try {
      const { success, data, error } =
        await getBookingLocationAction(bookingId);

      if (!success || !data?.length) {
        toast.error(error ?? "Failed to get location");
        return;
      }

      const latitude = Number(data[0].latitude);
      const longitude = Number(data[0].longitude);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        toast.error("Invalid location coordinates");
        return;
      }

      const mapUrl = getGoogleMapsUrl(latitude, longitude);
      window.open(mapUrl, "_blank", "noopener,noreferrer");
    } finally {
      setPendingAction(null);
      setPendingBookingId(null);
    }
  }

  async function complete(
    bookingId: string,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: string) => void;
    },
  ) {
    setPendingAction("complete");
    setPendingBookingId(bookingId);

    try {
      const res = await completeBookingAction(bookingId);

      if (!res.success) {
        const message = res.error || "Something went wrong";

        setError(message);
        toast.error(message);
        options?.onError?.(message);
        return;
      }

      toast.success("Booking completed successfully");

      options?.onSuccess?.({
        booking: res.data,
      });

      router.refresh();
    } finally {
      setPendingAction(null);
      setPendingBookingId(null);
    }
  }

  return {
    error,
    create,
    cancel,
    rebook,
    confirm,
    viewMap,
    pendingAction,
    pendingBookingId,
    complete,
  };
}
