export type StatusScope = "table" | "food";
export type WorkflowStatus = {
  id: string; scope: StatusScope; code: string | null; label: string;
  sortOrder: number; isRequired: boolean; isTerminal: boolean; inUse: boolean;
};
export type WorkflowActionState = { success: boolean; message: string };
export type FoodWorkItem = {
  id: string; orderId: string; tableCode: string; name: string; quantity: number;
  protein: string | null; isSpecial: boolean; lineTotal: string; statusId: string; statusLabel: string;
  nextStatusId: string | null; nextStatusLabel: string | null; createdAt: string;
};
export type ServiceTable = {
  id: string; name: string; stateToken: string; statusId: string; statusLabel: string; occupied: boolean;
  nextStatusId: string; nextStatusLabel: string; canAdvance: boolean;
  blockedReason: string | null; totalAmount: string; items: FoodWorkItem[]; sessionId: string | null;
};
