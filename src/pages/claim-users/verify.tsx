import { Button, createStyles, Group, LoadingOverlay, Modal, ScrollArea, Stack, Table, Title } from "@mantine/core";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Layout } from "~/components/layout/layout";
import { VERIFY_CLAIM_PATHNAME } from "~/consts/pathnames";
import { ADMIN_PERMISSION_STRINGS } from "~/server/api/utils/permissions";
import { isPermitted } from "~/utils/permissions";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { pageTitle } from "~/styles/pageTitle";
import { api } from "~/utils/api";




const PAGE_TITLE = "Verify Claims";
const PAGE_DESCRIPTION = "Verify legacy user claims.";




const useStyles = createStyles(
    (theme) => ({
        pageTitle,
        scrollArea: {
            height: `${pageContentHeightPixels}px`,
            color: theme.white,
        },
    }),
);




type ClaimToVerify = {
    id: number;
    claimingUser: string;
    claimedUser: string;
};




const VerifyClaim: NextPage = () => {
    const { status: sessionStatus, data: sessionData } = useSession();


    const userClaimsQuery = api.user.userClaim.getAll.useQuery({}, { queryKey: ["user.userClaim.getAll", {}] });
    const userClaims = userClaimsQuery.data ?? [];


    const [claimToVerify, setClaimToVerify] = useState<ClaimToVerify | null>(null);


    const utils = api.useUtils();

    const onSuccess = async () => {
        await Promise.all([
            utils.user.userClaim.invalidate()
        ]);

        setClaimToVerify(null);
    };

    const verifyUserClaimMutation = api.user.userClaim.verify.useMutation({ onSuccess });
    const rejectUserClaimMutation = api.user.userClaim.delete.useMutation({ onSuccess });


    const isLoading = sessionStatus === "loading";

    const isUserPermitted = !isLoading && sessionData !== null && isPermitted(sessionData.user.permissions, ADMIN_PERMISSION_STRINGS);


    const { classes } = useStyles();


    if (!isUserPermitted) {
        return (
            <Layout
                pageTitle={PAGE_TITLE}
                pageDescription={PAGE_DESCRIPTION}
                pathname={VERIFY_CLAIM_PATHNAME}
            >
                <p>You do not have permission to view this page.</p>
            </Layout>
        );
    }


    return (
        <Layout
            pageTitle={PAGE_TITLE}
            pageDescription={PAGE_DESCRIPTION}
            pathname={VERIFY_CLAIM_PATHNAME}
        >
            <Modal
                opened={!isLoading && claimToVerify !== null}
                onClose={() => { setClaimToVerify(null); }}
                title="Verify Claim"
                centered
            >
                {claimToVerify && (
                    <Stack
                        align="flex-end"
                    >
                        <p>
                            Verify claim {claimToVerify.id}? {claimToVerify.claimingUser} is claiming {claimToVerify.claimedUser}
                        </p>
                        <Group>
                            <Button
                                onClick={() => { verifyUserClaimMutation.mutate({ id: claimToVerify.id }); }}
                            >
                                Verify
                            </Button>
                            <Button
                                onClick={() => { rejectUserClaimMutation.mutate({ id: claimToVerify.id }); }}
                                color="red"
                            >
                                Reject
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
            <ScrollArea
                offsetScrollbars
                className={classes.scrollArea}
            >
                <LoadingOverlay
                    visible={isLoading}
                    color="rgba(0, 0, 0, 0.5)"
                />
                <Title
                    className={classes.pageTitle}
                    order={1}
                >
                    {PAGE_TITLE}
                </Title>
                <Table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>By</th>
                            <th>For</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {userClaims.map(
                            (claim) => {
                                const claimingUser = `${claim.User_claimedBy.discordUsername}#${claim.User_claimedBy.discordDiscriminator}`;
                                const claimedUser = `${claim.User_claimedUser.discordUsername}#${claim.User_claimedUser.discordDiscriminator}`;

                                return (
                                    <tr key={claim.id}>
                                        <td>{claim.id}</td>
                                        <td>{claimingUser}</td>
                                        <td>{claimedUser}</td>
                                        <td>
                                            <Button
                                                onClick={
                                                    () => {
                                                        setClaimToVerify({
                                                            id: claim.id,
                                                            claimingUser,
                                                            claimedUser,
                                                        });
                                                    }
                                                }
                                            >
                                                Resolve
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </Table>
            </ScrollArea>
        </Layout >
    );
};

export default VerifyClaim;