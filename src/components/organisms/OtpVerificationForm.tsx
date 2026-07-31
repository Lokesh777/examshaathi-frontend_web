import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/atoms/Spinner";
import { OtpInputGroup } from "@/components/molecules/OtpInputGroup";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { OTP_EXPIRY_MINUTES, OTP_LENGTH } from "@/constants/auth";

/**
 * The ONE OTP form. Verify-email, login OTP, reset-password and the
 * change-password step-up all compose this instead of re-implementing it.
 */
export function OtpVerificationForm({
  destination,
  submitLabel = "Verify",
  loading,
  error,
  onSubmit,
  onResend,
  children,
  disabled,
}: {
  destination?: string;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  onSubmit: (otp: string) => void;
  onResend?: () => void | Promise<unknown>;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const [otp, setOtp] = useState("");
  const { remaining, canResend, restart } = useOtpTimer();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(otp);
      }}
    >
      <p className="text-sm text-muted-foreground">
        Enter the {OTP_LENGTH}-digit code
        {destination ? (
          <>
            {" "}
            sent to <span className="font-semibold text-foreground">{destination}</span>
          </>
        ) : null}
        . It expires in {OTP_EXPIRY_MINUTES} minutes and can be used once.
      </p>

      <OtpInputGroup value={otp} onChange={setOtp} invalid={Boolean(error)} disabled={loading} />
      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      {children}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold"
        disabled={loading || disabled || otp.length < OTP_LENGTH}
      >
        {loading && <Spinner className="mr-2" />}
        {submitLabel}
      </Button>

      {onResend && (
        <div className="text-center text-sm text-muted-foreground">
          {canResend ? (
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={async () => {
                await onResend();
                setOtp("");
                restart();
              }}
            >
              Resend code
            </button>
          ) : (
            <>Resend code in {remaining}s</>
          )}
        </div>
      )}
    </form>
  );
}