import "server-only";

import { and, eq, gte, notInArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { goals, invoices, projects, tasks, transactions } from "@/db/schema";
import { startOfMonth } from "@/lib/data/dashboard/utils";

export type LandingWorkspaceSnapshot = {
  activeProjects: number;
  availableCash: number;
  goalAverageProgress: number;
  monthlyIncome: number;
  openTasks: number;
  outstandingInvoices: number;
};

function toDateOnlyValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getLandingWorkspaceSnapshot(
  workspaceId: string
): Promise<LandingWorkspaceSnapshot> {
  const monthStart = toDateOnlyValue(startOfMonth());

  const [
    activeProjectsResult,
    availableCashResult,
    goalAverageProgressResult,
    monthlyIncomeResult,
    openTasksResult,
    outstandingInvoicesResult,
  ] = await Promise.all([
    db
      .select({
        value: sql<number>`cast(count(*) as integer)`,
      })
      .from(projects)
      .where(
        and(
          eq(projects.workspaceId, workspaceId),
          notInArray(projects.status, ["completed", "cancelled"])
        )
      ),
    db
      .select({
        value: sql<number>`cast(
          coalesce(
            sum(
              case
                when ${transactions.type} = 'income' then ${transactions.amount}
                else (${transactions.amount} * -1)
              end
            ),
            0
          ) as double precision
        )`,
      })
      .from(transactions)
      .where(eq(transactions.workspaceId, workspaceId)),
    db
      .select({
        value: sql<number>`cast(coalesce(avg(${goals.progress}), 0) as integer)`,
      })
      .from(goals)
      .where(eq(goals.workspaceId, workspaceId)),
    db
      .select({
        value: sql<number>`cast(coalesce(sum(${transactions.amount}), 0) as double precision)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.workspaceId, workspaceId),
          eq(transactions.type, "income"),
          gte(transactions.transactionDate, monthStart)
        )
      ),
    db
      .select({
        value: sql<number>`cast(count(*) as integer)`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.workspaceId, workspaceId),
          notInArray(tasks.status, ["done", "cancelled"])
        )
      ),
    db
      .select({
        value: sql<number>`cast(
          coalesce(sum(${invoices.total} - ${invoices.paidAmount}), 0) as double precision
        )`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspaceId, workspaceId),
          notInArray(invoices.status, ["paid", "cancelled"])
        )
      ),
  ]);

  return {
    activeProjects: activeProjectsResult[0]?.value ?? 0,
    availableCash: availableCashResult[0]?.value ?? 0,
    goalAverageProgress: goalAverageProgressResult[0]?.value ?? 0,
    monthlyIncome: monthlyIncomeResult[0]?.value ?? 0,
    openTasks: openTasksResult[0]?.value ?? 0,
    outstandingInvoices: outstandingInvoicesResult[0]?.value ?? 0,
  };
}
