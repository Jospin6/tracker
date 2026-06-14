"use client";

import { switchActivityAction } from "@/app/actions";
import { formSelectClassName } from "@/components/dashboard/ui";

export function ActivitySelect({
  activeActivityId,
  activities,
}: {
  activeActivityId: string | null;
  activities: Array<{ id: string; name: string }>;
}) {
  return (
    <form action={switchActivityAction}>
      <label className="sr-only" htmlFor="activityId">
        Activite
      </label>
      <select
        id="activityId"
        name="activityId"
        defaultValue={activeActivityId ?? ""}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={formSelectClassName}
      >
        {activities.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.name}
          </option>
        ))}
      </select>
    </form>
  );
}
