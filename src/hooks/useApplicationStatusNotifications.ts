import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

type AppRow = {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "submitted",
  under_review: "under review",
  shortlisted: "shortlisted 🎉",
  interview: "moved to interview",
  offer: "received an offer 🎉",
  hired: "marked as hired 🎉",
  rejected: "not selected",
  withdrawn: "withdrawn",
};

function labelFor(status: string) {
  return STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}

/**
 * Subscribes to job_applications changes for the current user and surfaces
 * toast notifications when the backend updates application state.
 */
export function useApplicationStatusNotifications() {
  const user = useAuthStore((s) => s.user);
  const lastStatus = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) {
      lastStatus.current.clear();
      return;
    }
    const applicantId = user.id;
    const channel = supabase
      .channel(`job-apps-${applicantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_applications",
          filter: `applicant_id=eq.${applicantId}`,
        },
        (payload) => {
          const newRow = payload.new as AppRow | null;
          const oldRow = payload.old as AppRow | null;
          if (payload.eventType === "INSERT" && newRow) {
            lastStatus.current.set(newRow.id, newRow.status);
            toast.success("Application submitted", {
              description: `Status: ${labelFor(newRow.status)}`,
            });
          } else if (payload.eventType === "UPDATE" && newRow) {
            const prev = lastStatus.current.get(newRow.id) ?? oldRow?.status;
            if (prev !== newRow.status) {
              lastStatus.current.set(newRow.id, newRow.status);
              const tone =
                newRow.status === "rejected" || newRow.status === "withdrawn"
                  ? toast.error
                  : toast.success;
              tone("Application update", {
                description: `Your application is now ${labelFor(newRow.status)}.`,
              });
            }
          } else if (payload.eventType === "DELETE" && oldRow) {
            lastStatus.current.delete(oldRow.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
