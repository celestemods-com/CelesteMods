import { Button, createStyles, LoadingOverlay, ScrollArea, Table, Title } from "@mantine/core";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Layout } from "~/components/layout/layout";
import { cmlDiscordInviteUrl } from "~/consts/cmlDiscordInviteUrl";
import { CLAIM_USER_PATHNAME, VERIFY_CLAIM_PATHNAME } from "~/consts/pathnames";
import { ADMIN_PERMISSION_STRINGS } from "~/server/api/utils/permissions";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { pageTitle } from "~/styles/pageTitle";
import { api } from "~/utils/api";
import { isPermitted } from "~/utils/permissions";




const PAGE_TITLE = "Claim Users";
const PAGE_DESCRIPTION = "Submit a claim for a legacy user.";




const useStyles = createStyles(
    (theme) => ({
        pageTitle,
        scrollArea: {
            height: `${pageContentHeightPixels}px`,
            color: theme.white,
        },
        link: {
            textDecoration: "underline",
        },
        sectionTitle: {
            marginTop: "25px",
            marginBottom: "4px",
        },
        sectionInfo: {
            marginTop: "4px",
            marginBottom: "4px",
        },
    }),
);




const ClaimUser: NextPage = () => {
    const { status: sessionStatus, data: sessionData } = useSession();
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


    const isLoading = sessionStatus === "loading";

    const isAdmin = !isLoading && sessionData !== null && isPermitted(sessionData.user.permissions, ADMIN_PERMISSION_STRINGS);


    const { classes } = useStyles();


    if (sessionStatus === "unauthenticated") {
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
                <LoadingOverlay
                    visible={isLoading}
                />
                <Title className={classes.pageTitle} order={1}>{PAGE_TITLE}</Title>
                {isAdmin && (
                    <p>
                        Click <Link className={classes.link} href={VERIFY_CLAIM_PATHNAME}>here</Link> to verify users.
                    </p>
                )}
                <Title order={2}>Active Claims</Title>
                <p className={classes.sectionInfo}>
                    Contact us on <Link href={cmlDiscordInviteUrl} className={classes.link} target="_blank">Discord</Link> to get your claims verified.
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
                        {userClaims.map(
                            (claim) => (
                                <tr key={claim.id}>
                                    <td>{claim.id}</td>
                                    <td>{claim.claimedUserId}</td>
                                    <td>{claim.User_claimedUser.discordUsername}#{claim.User_claimedUser.discordDiscriminator}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </Table>
                <Title className={classes.sectionTitle} order={2}>Unlinked Users</Title>
                <Table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {unclaimedUsers.map(
                            (unclaimedUser) => (
                                <tr key={unclaimedUser.id}>
                                    <td>
                                        {unclaimedUser.discordUsername}#{unclaimedUser.discordDiscriminator}
                                    </td>
                                    <td>
                                        <Button
                                            disabled={createUserClaimMutation.isLoading}
                                            onClick={() => createUserClaimMutation.isLoading ? undefined : createUserClaimMutation.mutate({ claimedUserId: unclaimedUser.id })}
                                        >
                                            Claim
                                        </Button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </Table>
            </ScrollArea>
        </Layout>
    );
};

export default ClaimUser;