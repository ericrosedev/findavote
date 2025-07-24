import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { Principal } from '@dfinity/principal';
import { UserProfile, UserInfo, UserRole, ApprovalStatus, Post } from '../../declarations/findavote_backend/findavote_backend.did';

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!actor) return null;
      const result = await actor.getUserProfile();
      return result.length > 0 ? result[0]! : null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('No actor');
      return actor.saveUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCurrentUserAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCurrentUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('No actor available');
      return actor.getCurrentUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserInfo[]>({
    queryKey: ['listUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ user, approval }: { user: string, approval: ApprovalStatus }) => {
      if (!actor) throw new Error('No actor');
      return actor.setApproval(Principal.fromText(user), approval);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listUsers'] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ user, role }: { user: string, role: UserRole }) => {
      if (!actor) throw new Error('No actor');
      return actor.assignRole(Principal.fromText(user), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listUsers'] });
    },
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserPosts() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<Post[]>({
    queryKey: ['userPosts', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getPostsByAuthor(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ title, description, imagePath }: { title: string, description: string, imagePath: string }) => {
      if (!actor) throw new Error('No actor');
      return actor.createPost(title, description, imagePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: (error) => {
      console.error('Create post error:', error);
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, title, description, imagePath }: { postId: bigint, title: string, description: string, imagePath: string }) => {
      if (!actor) throw new Error('No actor');
      // Delete the old post and create a new one (since backend doesn't have update)
      await actor.deletePost(postId);
      return actor.createPost(title, description, imagePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: (error) => {
      console.error('Update post error:', error);
    },
  });
}

export function useDeleteUserPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('No actor');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: (error) => {
      console.error('Delete post error:', error);
    },
  });
}

export function useRemovePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('No actor');
      return actor.removePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
    onError: (error) => {
      console.error('Remove post error:', error);
    },
  });
}