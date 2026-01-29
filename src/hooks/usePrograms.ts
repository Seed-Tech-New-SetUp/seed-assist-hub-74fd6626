import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPrograms,
  fetchProgramInfo,
  saveProgramInfo,
  fetchProgramFeatures,
  saveProgramFeature,
  deleteProgramFeature,
  fetchProgramMembers,
  saveProgramMember,
  deleteProgramMember,
  fetchProgramRankingsWithOrganizations,
  saveProgramRanking,
  deleteProgramRanking,
  fetchProgramRecruiters,
  saveProgramRecruiters,
  fetchProgramJobRoles,
  saveProgramJobRoles,
  fetchProgramFAQs,
  saveProgramFAQs,
  fetchProgramPOC,
  saveProgramPOC,
  requestNewProgram,
  Program,
  ProgramInfo,
  ProgramFeature,
  ProgramMember,
  ProgramRanking,
  ProgramRecruiter,
  ProgramFAQ,
  ProgramPOC,
  RankingOrganization,
} from "@/lib/api/programs";

// ============ Programs List Hook ============

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============ Program Info Hook ============

export function useProgramInfo(programId: string | null) {
  return useQuery({
    queryKey: ["program-info", programId],
    queryFn: () => (programId ? fetchProgramInfo(programId) : null),
    enabled: !!programId,
  });
}

export function useSaveProgramInfo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, info }: { programId: string; info: Partial<ProgramInfo> }) =>
      saveProgramInfo(programId, info),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-info", programId] });
      toast({ title: "Success", description: "Program information saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program Features Hook ============

export function useProgramFeatures(programId: string | null) {
  return useQuery({
    queryKey: ["program-features", programId],
    queryFn: () => (programId ? fetchProgramFeatures(programId) : []),
    enabled: !!programId,
  });
}

export function useSaveProgramFeature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, feature }: { programId: string; feature: ProgramFeature }) =>
      saveProgramFeature(programId, feature),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-features", programId] });
      toast({ title: "Success", description: "Feature added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteProgramFeature() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, featureId }: { programId: string; featureId: string }) =>
      deleteProgramFeature(programId, featureId),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-features", programId] });
      toast({ title: "Success", description: "Feature removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program Members Hook ============

export function useProgramMembers(programId: string | null, category: "faculty" | "current_student" | "alumni") {
  return useQuery({
    queryKey: ["program-members", programId, category],
    queryFn: () => (programId ? fetchProgramMembers(programId, category) : []),
    enabled: !!programId,
  });
}

export function useSaveProgramMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      programId,
      category,
      member,
    }: {
      programId: string;
      category: "faculty" | "current_student" | "alumni";
      member: ProgramMember;
    }) => saveProgramMember(programId, category, member),
    onSuccess: (_, { programId, category }) => {
      queryClient.invalidateQueries({ queryKey: ["program-members", programId, category] });
      toast({ title: "Success", description: "Member added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteProgramMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      programId,
      category,
      memberId,
    }: {
      programId: string;
      category: "faculty" | "current_student" | "alumni";
      memberId: string;
    }) => deleteProgramMember(programId, category, memberId),
    onSuccess: (_, { programId, category }) => {
      queryClient.invalidateQueries({ queryKey: ["program-members", programId, category] });
      toast({ title: "Success", description: "Member removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program Rankings Hook ============

export function useProgramRankingsWithOrganizations(programId: string | null) {
  return useQuery({
    queryKey: ["program-rankings", programId],
    queryFn: () => (programId ? fetchProgramRankingsWithOrganizations(programId) : { rankings: [], organizations: [] }),
    enabled: !!programId,
  });
}

export function useSaveProgramRanking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, ranking }: { programId: string; ranking: ProgramRanking }) =>
      saveProgramRanking(programId, ranking),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-rankings", programId] });
      toast({ title: "Success", description: "Ranking added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteProgramRanking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, rankingOrgId, rankingAdditionId }: { 
      programId: string; 
      rankingOrgId: string; 
      rankingAdditionId: string;
    }) =>
      deleteProgramRanking(programId, rankingOrgId, rankingAdditionId),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-rankings", programId] });
      toast({ title: "Success", description: "Ranking removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program Recruiters Hook ============

export function useProgramRecruiters(programId: string | null) {
  return useQuery({
    queryKey: ["program-recruiters", programId],
    queryFn: () => (programId ? fetchProgramRecruiters(programId) : []),
    enabled: !!programId,
  });
}

export function useSaveProgramRecruiters() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, recruiters }: { programId: string; recruiters: string[] }) =>
      saveProgramRecruiters(programId, recruiters),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-recruiters", programId] });
      toast({ title: "Success", description: "Recruiters updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program Job Roles Hook ============

export function useProgramJobRoles(programId: string | null) {
  return useQuery({
    queryKey: ["program-jobroles", programId],
    queryFn: () => (programId ? fetchProgramJobRoles(programId) : []),
    enabled: !!programId,
  });
}

export function useSaveProgramJobRoles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, jobRoles }: { programId: string; jobRoles: string[] }) =>
      saveProgramJobRoles(programId, jobRoles),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-jobroles", programId] });
      toast({ title: "Success", description: "Job roles updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program FAQs Hook ============

export function useProgramFAQs(programId: string | null) {
  return useQuery({
    queryKey: ["program-faqs", programId],
    queryFn: () => (programId ? fetchProgramFAQs(programId) : []),
    enabled: !!programId,
  });
}

export function useSaveProgramFAQs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, faqs }: { programId: string; faqs: ProgramFAQ[] }) =>
      saveProgramFAQs(programId, faqs),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-faqs", programId] });
      toast({ title: "Success", description: "FAQs updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Program POC Hook ============

export function useProgramPOC(programId: string | null) {
  return useQuery({
    queryKey: ["program-poc", programId],
    queryFn: () => (programId ? fetchProgramPOC(programId) : null),
    enabled: !!programId,
  });
}

export function useSaveProgramPOC() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programId, poc }: { programId: string; poc: ProgramPOC }) =>
      saveProgramPOC(programId, poc),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: ["program-poc", programId] });
      toast({ title: "Success", description: "Contact saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ============ Request New Program Hook ============

export function useRequestNewProgram() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ programName, programDescription }: { programName: string; programDescription: string }) =>
      requestNewProgram(programName, programDescription),
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "Your request for a new program has been submitted for review." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
