export default function ProfilePage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Account</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Profile</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Profile management will be available here.</p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
            <span className="text-sm font-extrabold">A</span>
          </div>
          <div>
            <div className="text-sm font-extrabold">Admin</div>
            <div className="text-xs text-muted">admin@trackpro.local</div>
          </div>
        </div>
      </div>
    </div>
  );
}

