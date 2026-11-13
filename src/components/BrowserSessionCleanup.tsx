'use client';
import { useEffect } from 'react';

export default function BrowserSessionCleanup() {
  useEffect(() => { try { localStorage.removeItem('stt_admin_session'); } catch { /* Storage can be disabled. */ } }, []);
  return null;
}
