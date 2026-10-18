export type NotificationDestination =
  | { route: "/inbox" }
  | { route: "/projects/[projectId]"; params: { projectId: string } }
  | { route: "/documents/[documentId]"; params: { documentId: string } };

const safeId = /^[a-zA-Z0-9_-]{1,80}$/;

export function parseNotificationDestination(data: Record<string, unknown>): NotificationDestination | null {
  if (data.type === "inbox") return { route: "/inbox" };
  if (data.type === "project" && typeof data.projectId === "string" && safeId.test(data.projectId)) {
    return { route: "/projects/[projectId]", params: { projectId: data.projectId } };
  }
  if (data.type === "document" && typeof data.documentId === "string" && safeId.test(data.documentId)) {
    return { route: "/documents/[documentId]", params: { documentId: data.documentId } };
  }
  return null;
}

export async function openNotification(
  data: Record<string, unknown>,
  authorize: (destination: NotificationDestination) => Promise<boolean>,
  navigate: (destination: NotificationDestination) => void,
) {
  const destination = parseNotificationDestination(data);
  if (!destination || !(await authorize(destination))) return false;
  navigate(destination);
  return true;
}
