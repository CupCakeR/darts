import { useState, type FormEvent } from "react";
import { ApiError } from "../../data/client.ts";
import { useLogin } from "../../data/queries.ts";
import { de } from "../../i18n/de.ts";
import { Button } from "../../ui/button.tsx";
import { TextInput } from "../../ui/text-input.tsx";

function errorMessage(error: Error | null) {
  if (!error) return null;
  if (error instanceof ApiError && error.status === 401) return de.auth.invalidPin;
  if (error instanceof ApiError && error.status === 429) return de.auth.tooManyAttempts;
  return de.common.error;
}

export function PinScreen() {
  const [pin, setPin] = useState("");
  const login = useLogin();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate(pin, { onError: () => setPin("") });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form onSubmit={submit} className="flex w-full max-w-xs flex-col gap-4">
        <h1 className="text-3xl font-bold">{de.auth.title}</h1>
        <TextInput
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          value={pin}
          onChange={(event) => setPin(event.target.value)}
        />
        <p
          key={login.failureCount}
          className={`min-h-6 text-board-red ${login.error ? "animate-shake" : ""}`}
        >
          {errorMessage(login.error)}
        </p>
        <Button type="submit" disabled={!pin || login.isPending}>
          {de.auth.submit}
        </Button>
      </form>
    </main>
  );
}
