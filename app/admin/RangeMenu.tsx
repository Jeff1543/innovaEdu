"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// Pilihan rentang bulan untuk grafik pendapatan. Memilih = pindah ke /admin?bulan=N (data dihitung ulang di server).
export function RangeMenu({ value, options }: { value: number; options: number[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const klik = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", klik);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", klik); document.removeEventListener("keydown", esc); };
  }, []);
  return (
    <div className="range-menu" ref={ref}>
      <button type="button" className="select-button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        {value} Bulan Terakhir <ChevronDown size={15} />
      </button>
      {open && (
        <div className="range-list" role="listbox">
          {options.map((n) => (
            <Link key={n} role="option" aria-selected={n === value} href={`/admin?bulan=${n}`} className={n === value ? "on" : ""} onClick={() => setOpen(false)}>
              {n} Bulan Terakhir
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
