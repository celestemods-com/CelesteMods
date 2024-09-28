import { Button, createStyles, Modal, ScrollArea, Stack, Table } from "@mantine/core";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Layout } from "~/components/layout/layout";
import { VERIFY_CLAIM_PATHNAME } from "~/consts/pathnames";
import { ADMIN_PERMISSION_STRINGS } from "~/server/api/utils/permissions";
import { isPermitted } from "~/utils/permissions";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { api } from "~/utils/api";




const PAGE_TITLE = "Verify Claim";
const PAGE_DESCRIPTION = "Verify legacy user claims.";




const useStyles = createStyles(
    (theme) => ({
        scrollArea: {
            height: `${pageContentHeightPixels}px`,
            color: theme.white,
        },
    }),
);




const VerifyClaim: NextPage = () => {
    const { status, data: sessionData } = useSession();


    const userClaimsQuery = api.user.userClaim.getAll.useQuery({}, { queryKey: ["user.userClaim.getAll", {}] });
    const userClaims = userClaimsQuery.data ?? [];


    const [claimToVerify, setClaimToVerify] = useState<{
        id: number,
        claimedBy: string,
        claimedUserId: string;
    } | null>(null);


    const utils = api.useUtils();

    const verifyUserClaimMutation = api.user.userClaim.verify.useMutation({
        async onSuccess() {
            await Promise.all([
                utils.user.userClaim.invalidate()
            ]);

            setClaimToVerify(null);
        }
    });


    const { classes } = useStyles();

    if (status === "loading") {
        return (
            <Layout
                pageTitle={PAGE_TITLE}
                pageDescription={PAGE_DESCRIPTION}
                pathname={VERIFY_CLAIM_PATHNAME}
            >
                <></>
            </Layout>
        );
    }
    else if (sessionData === null || !isPermitted(sessionData.user.permissions, ADMIN_PERMISSION_STRINGS)) {
        return (
            <Layout
                pageTitle={PAGE_TITLE}
                pageDescription={PAGE_DESCRIPTION}
                pathname={VERIFY_CLAIM_PATHNAME}
            >
                Login as an admin/superadmin to verify users.
            </Layout>
        );
    }

    return (
        <Layout
            pageTitle={PAGE_TITLE}
            pageDescription={PAGE_DESCRIPTION}
            pathname={VERIFY_CLAIM_PATHNAME}
        >
            <Modal opened={claimToVerify !== null} onClose={() => { setClaimToVerify(null); }} title="Confirmation" centered>
                {claimToVerify && (
                    <Stack align="flex-end">
                        <p>
                            Are you sure you want to verify claim {claimToVerify.id} by {claimToVerify.byUser} for {claimToVerify.forUser}?
                        </p>
                        <Button onClick={() => {
                            verifyUserClaimMutation.mutate({ id: claimToVerify.id });
                        }}>Verify</Button>
                    </Stack>
                )}
            </Modal>
            <ScrollArea
                offsetScrollbars
                className={classes.scrollArea}>
                <h1>User claims</h1>
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
                        {userClaims.map(claim => {
                            const byUser = `${claim.User_UserClaim_claimBy.discordUsername}#${claim.User_UserClaim_claimBy.discordDiscriminator}`;
                            const forUser = `${claim.User_UserClaim_claimFor.discordUsername}#${claim.User_UserClaim_claimFor.discordDiscriminator}`;
                            return (
                                <tr key={claim.id}>
                                    <td>{claim.id}</td>
                                    <td>{byUser}</td>
                                    <td>{forUser}</td>
                                    <td><Button onClick={() => {
                                        setClaimToVerify({
                                            id: claim.id,
                                            byUser,
                                            forUser,
                                        });
                                    }}>Verify</Button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </ScrollArea>
        </Layout>
    );
};

export default VerifyClaim;