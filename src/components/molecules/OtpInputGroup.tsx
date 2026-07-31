import { useEffect, useRef } from "react";
import { OtpDigitBox } from "@/components/atoms/OtpDigitBox";
import { OTP_LENGTH } from "@/constants/auth";

/**
 * The ONE OTP input UI in the app — used by verify-email, login OTP,
 * reset-password and the change-password step-up.
 */
export function OtpInputGroup({
  value,
  onChange,
  length = OTP_LENGTH,
  invalid,
  disabled,
  autoFocus = true,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[index] = digit || " ";
    onChange(chars.join("").replace(/\s/g, " ").trimEnd().replace(/\s/g, ""));
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDigit(index, "");
      return;
    }
    if (digits.length > 1) {
      onChange(digits.slice(0, length));
      refs.current[Math.min(digits.length, length - 1)]?.focus();
      return;
    }
    const chars = value.split("");
    chars[index] = digits;
    onChange(chars.join("").slice(0, length));
    refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <OtpDigitBox
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ""}
          invalid={invalid}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i]) {
              refs.current[i - 1]?.focus();
              onChange(value.slice(0, Math.max(0, i - 1)));
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
            if (pasted) onChange(pasted.slice(0, length));
          }}
        />
      ))}
    </div>
  );
}