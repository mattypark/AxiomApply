import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const shell =
  "w-full rounded-2xl bg-white/50 px-5 py-3.5 text-[0.95rem] text-ink " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(21,21,15,0.04)] " +
  "placeholder:text-faint outline-none transition-shadow duration-300 " +
  "focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_0_2px_rgba(47,107,61,0.45)]";

export function GlassInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${shell} ${className}`} />;
}

export function GlassTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`${shell} min-h-28 resize-y leading-relaxed ${className}`}
    />
  );
}

export function GlassSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${shell} appearance-none ${className}`}>
      {children}
    </select>
  );
}
