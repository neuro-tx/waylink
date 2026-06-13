import {
  createPlan,
  deletePlan,
  EditPlan,
  getAllPlans,
  toogleActivePlan,
} from "@/actions/plans.action";
import { Plan } from "@/lib/all-types";
import { PlanFormValues } from "@/validations";
import { useCallback, useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";
export type PlanMutationResult =
  | {
      success: true;
      type: "create" | "update";
      plan: Plan;
    }
  | {
      success: true;
      type: "delete";
      planId: string;
    }
  | {
      success: false;
      error: string;
    };

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchPlans = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const res = await getAllPlans();
      const data = Array.isArray(res) ? res : [res];

      setPlans(data ?? []);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const savePlan = useCallback(
    async (
      mode: "create" | "update",
      values: PlanFormValues,
      id?: string,
    ): Promise<PlanMutationResult> => {
      try {
        const res =
          mode === "create"
            ? await createPlan(values)
            : !id
              ? { success: false, error: "Missing Plan id" }
              : await EditPlan(id, values);

        if (!res.success || !res.data) {
          return {
            success: false,
            error: res.error ?? "Something went wrong",
          };
        }

        const newPlan: Plan = res.data;
        setPlans((prev) => {
          if (mode === "create") {
            return [newPlan, ...prev];
          }

          return prev.map((plan) => (plan.id === newPlan.id ? newPlan : plan));
        });

        return {
          success: true,
          type: mode === "create" ? "create" : "update",
          plan: res.data,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Something went wrong",
        };
      }
    },
    [],
  );

  const toggleActive = useCallback(
    async (id: string): Promise<PlanMutationResult> => {
      try {
        const res = await toogleActivePlan(id);
        if (!res.success || !res.data) {
          return {
            success: false,
            error: "Failed to change plan status.",
          };
        }

        setPlans((prev) =>
          prev.map((plan) => (plan.id === res.data.id ? res.data : plan)),
        );

        return {
          success: true,
          type: "update",
          plan: res.data,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Something went wrong",
        };
      }
    },
    [],
  );

  const remove = useCallback(
    async (id: string): Promise<PlanMutationResult> => {
      try {
        const res = await deletePlan(id);

        if (!res.success) {
          return {
            success: false,
            error: "Failed to delete plan.",
          };
        }

        setPlans((prev) => prev.filter((p) => p.id !== id));

        return {
          success: true,
          type: "delete",
          planId: id,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete plan.",
        };
      }
    },
    [],
  );

  return {
    plans,
    status,
    error,
    initialized,
    fetchPlans,
    setPlans,
    savePlan,
    toggleActive,
    remove,
  };
}
