import { useInternetIdentity } from 'ic-use-internet-identity';
// import { createActor, type backendInterface } from '../../declarations/findavote_backend';
import { createActor, canisterId } from '../../declarations/findavote_backend';
import { _SERVICE } from '../../declarations/findavote_backend/findavote_backend.did';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();

    const actorQuery = useQuery<_SERVICE>({
        queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
        queryFn: async () => {
            const isAuthenticated = !!identity;

            if (!isAuthenticated) {
                // Return anonymous actor if not authenticated
                return await createActor(canisterId);
            }

            const actorOptions = {
                agentOptions: {
                    identity
                }
            };

            const actor = await createActor(canisterId, actorOptions);
            await actor.initializeAuth();
            return actor;
        },
        // Only refetch when identity changes
        staleTime: Infinity,
        // This will cause the actor to be recreated when the identity changes
        enabled: true
    });

    // When the actor changes, invalidate dependent queries
    useEffect(() => {
        if (actorQuery.data) {
            queryClient.invalidateQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
            queryClient.refetchQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
        }
    }, [actorQuery.data, queryClient]);

    return {
        actor: actorQuery.data || null,
        isFetching: actorQuery.isFetching
    };
}