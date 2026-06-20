"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ImpersonatingOrg {
  orgId: string;
  orgName: string;
}

interface AdminAuthState {
  token: string | null;
  adminName: string;
  adminEmail: string;
  impersonating: ImpersonatingOrg | null;
  login: (token: string, name: string, email: string) => void;
  logout: () => void;
  startImpersonation: (org: ImpersonatingOrg) => void;
  stopImpersonation: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      adminName: "",
      adminEmail: "",
      impersonating: null,

      login: (token, name, email) =>
        set({ token, adminName: name, adminEmail: email }),

      logout: () =>
        set({ token: null, adminName: "", adminEmail: "", impersonating: null }),

      startImpersonation: (org) => set({ impersonating: org }),

      stopImpersonation: () => set({ impersonating: null }),
    }),
    {
      name: "stt_admin_token",
    }
  )
);
