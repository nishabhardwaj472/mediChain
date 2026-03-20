export type UserRole =
  | "admin"
  | "manufacturer"
  | "distributor"
  | "pharmacy"
  | "consumer";

export type RegisterRole =
  | "manufacturer"
  | "distributor"
  | "pharmacy"
  | "consumer";

/* =====================================================
   USER MODEL (FRONTEND)
===================================================== */
export interface AuthUser {
  _id?: string;
  email: string;
  role: UserRole;
  fullName?: string;
  walletAddress?: string;

  // blockchain + backend sync
  onChainApproved?: boolean;
  isApproved: boolean;
}

/* =====================================================
   APPROVAL FLOW (STRICT TYPING)
===================================================== */
export const APPROVER_FOR: Record<
  Extract<UserRole, "admin" | "manufacturer" | "distributor">,
  Extract<UserRole, "manufacturer" | "distributor" | "pharmacy">
> = {
  admin: "manufacturer",
  manufacturer: "distributor",
  distributor: "pharmacy",
};