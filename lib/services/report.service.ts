export const reportService = {
  monthlyReport: async (workspaceId: string) => {
    const response = await fetch(`/api/reports?workspaceId=${workspaceId}`);
    return response.json();
  },
  createReport: async (payload: Record<string, unknown>) => {
    return fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
