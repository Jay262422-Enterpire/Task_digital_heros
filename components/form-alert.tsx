import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FormAlert({
  error,
  success,
  className,
}: {
  error?: string;
  success?: string;
  className?: string;
}) {
  if (!error && !success) return null;
  return (
    <Alert variant={error ? "destructive" : "default"} className={className}>
      <AlertTitle>{error ? "Not saved" : "Done"}</AlertTitle>
      <AlertDescription>{error ?? success}</AlertDescription>
    </Alert>
  );
}
