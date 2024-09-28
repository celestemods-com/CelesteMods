import { Button, createStyles, ScrollArea, Table } from "@mantine/core";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { cmlDiscordInviteUrl } from "~/consts/cmlDiscordInviteUrl";
import { CLAIM_USER_PATHNAME } from "~/consts/pathnames";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { api } from "~/utils/api";




const PAGE_TITLE = "Claim User";
const PAGE_DESCRIPTION = "Submit a claim for a legacy user.";




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




const ClaimUser: NextPage = () => {
    const { status, data: sessionData } = useSession();
    const userId = sessionData?.user.id ?? "";


    // Get all unlinked legacy users
    const unlinkedUsersQuery = api.user.getUnlinked.useQuery({}, { queryKey: ["user.getUnlinked", {}] });
    const unlinkedUsers = unlinkedUsersQuery.data ?? [];


    // Get all claims made by the current user
    const userClaimsQuery = api.user.userClaim.getByClaimingUserId.useQuery({ userId }, { queryKey: ["user.userClaim.getByClaimingUserId", { userId }] });
    const userClaims = userClaimsQuery.data ?? [];


    // Sort legacy users based on if the current user has claimed them
    type UnlinkedUser = typeof unlinkedUsers[number];

    const claimedUsers: UnlinkedUser[] = [];
    const unclaimedUsers: UnlinkedUser[] = [];

    for (const unlinkedUser of unlinkedUsers) {
        const matchingUserClaim = userClaims.find(claim => claim.claimedUserId === unlinkedUser.id);

        if (matchingUserClaim) {
            claimedUsers.push(unlinkedUser);
        } else {
            unclaimedUsers.push(unlinkedUser);
        }
    }


    const utils = api.useUtils();

    const createUserClaimMutation = api.user.userClaim.add.useMutation({
        onSuccess() {
            utils.user.userClaim.getByClaimingUserId.invalidate({ userId });
        }
    });


    const { classes } = useStyles();


    if (status === 'unauthenticated') {
        return (
            <Layout
                pageTitle={PAGE_TITLE}
                pageDescription={PAGE_DESCRIPTION}
                pathname={CLAIM_USER_PATHNAME}
            >
                Login to claim users.
            </Layout>
        );
    }


    return (
        <Layout
            pageTitle={PAGE_TITLE}
            pageDescription={PAGE_DESCRIPTION}
            pathname={CLAIM_USER_PATHNAME}
        >
            <ScrollArea
                offsetScrollbars
                className={classes.scrollArea}
            >
                <h1>{PAGE_TITLE}</h1>
                <h2>Claimed Users</h2>
                <p>
                    Contact us on <Link href={cmlDiscordInviteUrl} className={classes.discordLink} target="_blank">Discord</Link> to get your claim verified.
                </p>
                <Table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>User ID</th>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userClaims.map(claim => (
                            <tr key={claim.id}>
                                <td>{claim.id}</td>
                                <td>{claim.claimedUserId}</td>
                                <td>{claim.User_claimedUser.discordUsername}#{claim.User_claimedUser.discordDiscriminator}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <h2>Unclaimed Users</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {unclaimedUsers.map(unclaimedUser => (
                            <tr key={unclaimedUser.id}>
                                <td>{unclaimedUser.discordUsername}#{unclaimedUser.discordDiscriminator}</td>
                                <td>
                                    <Button
                                        disabled={createUserClaimMutation.isLoading}
                                        onClick={() => {
                                            if (!createUserClaimMutation.isLoading) {
                                                createUserClaimMutation.mutate({
                                                    claimedUserId: unclaimedUser.id
                                                });
                                            }
                                        }}
                                    >
                                        Claim
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </ScrollArea>
        </Layout>
    );
};

export default ClaimUser;