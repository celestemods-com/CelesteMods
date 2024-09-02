import { Button, createStyles, ScrollArea, Table } from "@mantine/core";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { cmlDiscordInviteUrl } from "~/consts/cmlDiscordInviteUrl";
import { CLAIM_USER } from "~/consts/pathnames";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { api } from "~/utils/api";

const useStyles = createStyles(
    (theme) => ({
        scrollArea: {
            height: `${pageContentHeightPixels}px`,
            color: theme.white,
        },
        discordLink: {
            textDecoration: 'underline',
        }
    }),
);

const ClaimUser : NextPage = () => {
    const { status } = useSession();

    const utils = api.useUtils();
    const unlinkedUsersQuery = api.user.getUnlinked.useQuery({}, { queryKey: ["user.getUnlinked", {}] });
    const unlinkedUsers = unlinkedUsersQuery.data ?? [];
    const claimsQuery = api.user.getUserClaims.useQuery(undefined, { queryKey: ["user.getUserClaims", undefined] });
    const claims = claimsQuery.data ?? [];
    const unclaimedUsers = unlinkedUsers.filter(user => !claims.find(claim => claim.claimForUserId === user.id));

    const createUserClaimMutation = api.user.createUserClaim.useMutation({
        async onSuccess() {
            await Promise.all([
                utils.user.getUnlinked.invalidate(),
                utils.user.getUserClaims.invalidate()
            ]);
        }
    });

    const { classes } = useStyles();

    if (status === 'unauthenticated') {
        return (
            <Layout
              pageTitle="Claim user"
              pageDescription="Claim user"
              pathname={CLAIM_USER}
            >
                Login to claim users.
            </Layout>
          );
    }

    return (
        <Layout
          pageTitle="Claim user"
          pageDescription="Claim user"
          pathname={CLAIM_USER}
        >
          <ScrollArea
            offsetScrollbars
            className={classes.scrollArea}>
            <h1>Claim user</h1>
            <h2>Claimed users</h2>
            <p>
                Contact us on <Link href={cmlDiscordInviteUrl} className={classes.discordLink} target="_blank">Discord</Link> to get your claim verified.
            </p>
            <Table>
                <thead>
                    <tr>
                        <th>Claim ID</th>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Discriminator</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map(claim => (
                        <tr key={claim.id}>
                            <td>{claim.id}</td>
                            <td>{claim.claimForUserId}</td>
                            <td>{claim.User_UserClaim_claimFor.discordUsername}</td>
                            <td>{claim.User_UserClaim_claimFor.discordDiscriminator}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <h2>Users available</h2>
            <Table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Discriminator</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {unclaimedUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.discordUsername}</td>
                            <td>{user.discordDiscriminator}</td>
                            <td>
                                <Button onClick={() => {
                                    if (!createUserClaimMutation.isLoading) {
                                        createUserClaimMutation.mutate({
                                            forUserId: user.id
                                        });
                                    }
                                }} disabled={createUserClaimMutation.isLoading}>Claim</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
          </ScrollArea>
        </Layout>
      );
}

export default ClaimUser;