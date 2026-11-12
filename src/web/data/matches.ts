import type { CreateMatch, Match, MatchStatus } from "#contracts";
import type { Throw } from "#engine";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client.ts";

const keys = {
  all: ["matches"] as const,
  list: (status?: MatchStatus) => ["matches", "list", status ?? "all"] as const,
  detail: (id: string) => ["matches", "detail", id] as const,
};

export const useMatches = (status?: MatchStatus) =>
  useQuery({ queryKey: keys.list(status), queryFn: () => api.matches.list(status) });

export const useMatch = (id: string) => useQuery({ queryKey: keys.detail(id), queryFn: () => api.matches.get(id) });

export function useCreateMatch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMatch) => api.matches.create(input),
    onSuccess: (match) => {
      client.setQueryData(keys.detail(match.id), match);
      void client.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export type ThrowChange = { type: "add"; input: Throw } | { type: "replace"; seq: number; input: Throw } | { type: "undo" };

export function applyChange(throws: Throw[], change: ThrowChange): Throw[] {
  if (change.type === "add") return [...throws, change.input];
  if (change.type === "replace") return throws.with(change.seq, change.input);
  return throws.slice(0, -1);
}

function send(id: string, change: ThrowChange, seq: number) {
  if (change.type === "add") return api.matches.addThrow(id, seq, change.input);
  if (change.type === "replace") return api.matches.replaceThrow(id, change.seq, change.input);
  return api.matches.undo(id);
}

export function useThrowChanges(id: string) {
  const client = useQueryClient();
  const key = keys.detail(id);

  const mutation = useMutation({
    scope: { id: `match-${id}` },
    mutationFn: ({ change, seq }: { change: ThrowChange; seq: number }) => send(id, change, seq),
    onMutate: async ({ change }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Match>(key);
      if (previous) client.setQueryData<Match>(key, { ...previous, throws: applyChange(previous.throws, change) });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
      void client.invalidateQueries({ queryKey: key });
    },
    onSuccess: (match) => {
      const optimistic = client.getQueryData<Match>(key);
      const caughtUp = JSON.stringify(optimistic?.throws) === JSON.stringify(match.throws);
      if (caughtUp) client.setQueryData(key, match);
      void client.invalidateQueries({ queryKey: keys.all, refetchType: "none" });
    },
  });

  const submit = (change: ThrowChange) => {
    const current = client.getQueryData<Match>(key);
    mutation.mutate({ change, seq: current?.throws.length ?? 0 });
  };

  return { submit, error: mutation.error, reset: mutation.reset };
}

export function useAbandonMatch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.matches.abandon(id),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
}
