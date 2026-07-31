import { useCallback, useEffect, useState } from "react";
import { OTP_RESEND_SECONDS } from "@/constants/auth";

/** Shared resend cooldown used by every OTP screen. */
export function useOtpTimer(seconds: number = OTP_RESEND_SECONDS) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, canResend: remaining <= 0, restart };
}