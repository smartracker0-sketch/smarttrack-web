"use client";

import { create } from "zustand";

interface ImpersonatingOrg {
  orgId: string;
  orgName: string;
}

interface AdminAuthState {
  adminName: string;
  adminEmail: string;
  impersonating: ImpersonatingOrg | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  startImpersonation: (org: ImpersonatingOrg) => void;
  stopImpersonation: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    (set) => ({
      adminName: "",
      adminEmail: "",
      impersonating: null,

      login: (name, email) =>
        set({ adminName: name, adminEmail: email }),

      logout: () =>
        set({ adminName: "", adminEmail: "", impersonating: null }),

      startImpersonation: (org) => set({ impersonating: org }),

      stopImpersonation: () => set({ impersonating: null }),
    })
);
