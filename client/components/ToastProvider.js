"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Module-level bridge so non-component code (mutation helpers) can raise toasts
// without prop drilling or hooks.
let externalPush = null;
export function toast(message, type = "success") {
  if (externalPush) externalPush(message, type);
}

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((message, type) => {
    const id = ++idRef.current;
    setItems((xs) => [...xs, { id, message, type }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    externalPush = push;
    return () => {
      if (externalPush === push) externalPush = null;
    };
  }, [push]);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-2 text-sm shadow-lg ring-1 ring-inset ${
              t.type === "error"
                ? "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                : "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
