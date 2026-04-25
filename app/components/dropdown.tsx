import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type DropdownOption<T extends string> = {
    label: string;
    value: T;
};

type DropdownProps<T extends string> = {
    options: DropdownOption<T>[];
    value: T;
    onChange: (value: T) => void;
    placeholder?: string;
};

export default function Dropdown<T extends string>({
    options,
    value,
    onChange,
    placeholder = "Seleccionar",
}: DropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative w-64">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-md border border-bg-400 bg-bg-200 px-3 py-3 text-sm text-text-400 hover:border-primary-500 transition-colors"
            >
                <span>{selected?.label ?? placeholder}</span>

                <ChevronDown
                    className={`h-4 w-4 text-text-400 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            <div
                className={`
          absolute left-0 top-full mt-2 w-full overflow-hidden rounded-md border border-bg-400 bg-bg-200 text-xs shadow-md
          transition-all duration-200 origin-top z-50
          ${open
                        ? "scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }
        `}
            >
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                            onChange(opt.value);
                            setOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-bg-300 transition-colors"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}