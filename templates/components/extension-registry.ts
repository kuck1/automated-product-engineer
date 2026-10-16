type ActivityKind = "comment" | "status-change" | "submission";

type Activity = {
  id: string;
  kind: ActivityKind;
  summary: string;
};

type ActivityPresenter = (activity: Activity) => {
  label: string;
  tone: "neutral" | "positive" | "warning";
};

const presenters: Record<ActivityKind, ActivityPresenter> = {
  comment: (activity) => ({ label: activity.summary, tone: "neutral" }),
  "status-change": (activity) => ({ label: activity.summary, tone: "warning" }),
  submission: (activity) => ({ label: activity.summary, tone: "positive" }),
};

export function presentActivity(activity: Activity) {
  return presenters[activity.kind](activity);
}

// To add a supported kind, extend ActivityKind and register one presenter here.
// Views consume presentActivity and do not need kind-specific branches.
