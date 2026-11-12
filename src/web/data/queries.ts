import type { CreatePlayer, UpdatePlayer } from "#contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client.ts";

const keys = {
  session: ["session"] as const,
  players: (archived: boolean) => ["players", { archived }] as const,
};

export const useSession = () => useQuery({ queryKey: keys.session, queryFn: api.session });

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.login,
    onSuccess: () => client.invalidateQueries({ queryKey: keys.session }),
  });
}

export const usePlayers = (archived = false) =>
  useQuery({ queryKey: keys.players(archived), queryFn: () => api.players.list(archived) });

export function useCreatePlayer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlayer) => api.players.create(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useUpdatePlayer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePlayer }) => api.players.update(id, patch),
    onSuccess: () => client.invalidateQueries({ queryKey: ["players"] }),
  });
}
