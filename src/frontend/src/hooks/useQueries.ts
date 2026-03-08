import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Student } from "../backend.d";
import { useActor } from "./useActor";

export function useGetStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      rollNo: bigint;
      name: string;
      grNo: string;
      penNo: string;
      apaarNo: string;
      udiseCode: string;
      aadharNo: string;
      col1: string;
      col2: string;
      col3: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStudent(
        params.rollNo,
        params.name,
        params.grNo,
        params.penNo,
        params.apaarNo,
        params.udiseCode,
        params.aadharNo,
        params.col1,
        params.col2,
        params.col3,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      rollNo: bigint;
      name: string;
      grNo: string;
      penNo: string;
      apaarNo: string;
      udiseCode: string;
      aadharNo: string;
      col1: string;
      col2: string;
      col3: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateStudent(
        params.id,
        params.rollNo,
        params.name,
        params.grNo,
        params.penNo,
        params.apaarNo,
        params.udiseCode,
        params.aadharNo,
        params.col1,
        params.col2,
        params.col3,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export type { Student };
