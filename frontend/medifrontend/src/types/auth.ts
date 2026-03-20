export type UserRole =
    | "admin"
    | "manufacturer"
    | "distributor"
    | "pharmacy"
    | "consumer";

export interface AuthUser {
    _id?: string;
    email: string;
    role: UserRole;
    fullName?: string;
    walletAddress?: string;
    onChainApproved?: boolean;
    isApproved: boolean;
}

export const APPROVER_FOR: Record<string, string> = {
    admin: "manufacturer",
    manufacturer: "distributor",
    distributor: "pharmacy",
};
