"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  endpoint: string;
  id: number;
  confirm?: string;
  label?: string;
};

export default function DeleteButton({
  endpoint,
  id,
  confirm: confirmMsg = "确认删除？",
  label = "删除",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "删除失败");
    }
  };

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="text-text-muted hover:text-accent disabled:opacity-40"
    >
      {busy ? "…" : label}
    </button>
  );
}
