"use client";

type Variant = "primary" | "secondary" | "ghost" | "quiet-danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-spruce text-white hover:bg-spruce-deep shadow-lift",
  secondary:
    "bg-card text-ink border border-line hover:border-line-strong hover:bg-paper",
  ghost: "text-ink-soft hover:bg-spruce-wash hover:text-ink",
  "quiet-danger": "text-danger hover:bg-danger-soft",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    />
  );
}
