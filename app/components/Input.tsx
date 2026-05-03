import React, { createContext, useContext } from "react";
import type { LucideIcon } from "lucide-react";

type InputVariant = "default" | "inside card" | "error" | "success";
type InputSize = "normal" | "large";

type InputContextType = {
  id: string;
  value?: string | number;
  onChange?: (value: string) => void;
  maxLength?: number;
  type?: React.HTMLInputTypeAttribute;
  variant?: InputVariant;
  size?: InputSize;
};

const InputContext = createContext<InputContextType | null>(null);

function useInput() {
  const ctx = useContext(InputContext);
  if (!ctx) throw new Error("Input must be used inside Input.Root");
  return ctx;
}

function Root({
  id,
  value,
  onChange,
  maxLength,
  type = "text",
  variant = "default",
  size = "normal",
  children,
}: React.PropsWithChildren<InputContextType>) {
  return (
    <InputContext.Provider value={{ id, value, onChange, maxLength, type, variant, size }}>
      <div className="w-full flex flex-col gap-1">{children}</div>
    </InputContext.Provider>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const { id } = useInput();

  return (
    <label htmlFor={id} className="mb-1 text-badge-neutral-text">
      {children}
    </label>
  );
}

function getSizeClasses(size: InputSize) {
  switch (size) {
    case "large":
      return "h-48";
    default:
      return "h-12";
  }
}

function getFieldClasses(variant: InputVariant, hasIcon: boolean, size: InputSize, isNumber: boolean) {
  const sizeClasses = getSizeClasses(size);

  const base = `
    w-full rounded-lg ${sizeClasses} px-3 py-2.5
    backdrop-blur-sm transition-colors outline-none
    placeholder:text-(--color-badge-neutral-text) placeholder:opacity-80
    text-slate-600 dark:text-white/60
    ${hasIcon ? "pl-9" : ""}
    ${isNumber ? "appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""}
  `;

  switch (variant) {
    case "error":
      return `${base} bg-(--color-input-bg) border border-[color:var(--color-error-input-border)] focus:border-[color:var(--color-error-input-focus)]`;
    case "success":
      return `${base} bg-(--color-input-bg) border border-[color:var(--color-success-input-border)] focus:border-[color:var(--color-success-input-focus)]`;
    case "inside card":
      return `${base} bg-(--color-input-inside-card) border border-(--color-border-inside-card) focus:border-(--color-accent-focus)`;
    default:
      return `${base} bg-(--color-input-bg) border border-(--color-border-default) focus:border-(--color-accent-focus)`;
  }
}

function Field({
  placeholder,
  icon: Icon,
}: {
  placeholder?: string;
  icon?: LucideIcon;
}) {
  const { id, value, onChange, maxLength, type, variant, size } = useInput();
  const isLarge = size === "large";
  const isNumber = type === "number";

  return (
    <div className="relative w-full">
      {Icon && (
        <Icon
          strokeWidth={1.5}
          className={`absolute left-3 z-10 text-badge-neutral-text h-5 w-5 ${isLarge ? "top-3" : "top-1/2 -translate-y-1/2"
            }`}
        />
      )}

      {isLarge ? (
        <textarea
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`text-sm resize-none ${getFieldClasses(
            variant ?? "default",
            Boolean(Icon),
            size ?? "normal",
            false
          )}`}
        />
      ) : (
        <input
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          type={type}
          className={`text-sm ${getFieldClasses(
            variant ?? "default",
            Boolean(Icon),
            size ?? "normal",
            isNumber
          )}`}
        />
      )}
    </div>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-badge-neutral-text opacity-80">{children}</span>;
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-(--color-error-message)">{children}</span>;
}

function SuccessMessage({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-(--color-success-message)">{children}</span>;
}

export const Input = {
  Root,
  Label,
  Field,
  Helper,
  Error: ErrorMessage,
  Success: SuccessMessage,
};