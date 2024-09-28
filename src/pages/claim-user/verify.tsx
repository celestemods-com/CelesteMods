import { Button, createStyles, Modal, ScrollArea, Stack, Table } from "@mantine/core";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Layout } from "~/components/layout/layout";
import { VERIFY_CLAIM_PATHNAME } from "~/consts/pathnames";
import { pageContentHeightPixels } from "~/styles/pageContentHeightPixels";
import { api } from "~/utils/api";

const useStyles = createStyles(
    (theme) => ({
        scrollArea: {
            height: `${pageContentHeightPixels}px`,
            color: theme.white,
        },
    }),
);

const VerifyClaim : NextPage = () => {
    const { data: session, status } = useSession();

    const utils = api.useUtils();
    const userClaimsQuery = api.user.getAllUserClaims.useQuery();
    const userClaims = userClaimsQuery.data ?? [];

    const verifyUserClaimMutation = api.user.verifyUserClaim.useMutation({
        async onSuccess() {
            await Promise.all([
                utils.user.getAllUserClaims.invalidate(),
                utils.user.getUserClaims.invalidate()
            ]);
            setClaimToVerify(null);
        }
    });

    const [claimToVerify, setClaimToVerify] = useState<{ id: number, byUser: string, forUser: string } | null>(null);

    const { classes } = useStyles();

    if (status === 'loading') {
        return (
            <Layout
              pageTitle="Verify claim"
              pageDescription="Verify claim"
              pathname={VERIFY_CLAIM_PATHNAME}
            >
                <></>
            </Layout>
          );
    }
    else if (session === null || !(session.user.permissions.find(p => p === 'Admin' || p === 'Super_Admin'))) {
        return (
            <Layout
                pageTitle="Verify claim"
                pageDescription="Verify claim"
                pathname={VERIFY_CLAIM_PATHNAME}
            >
                Login as an admin/superadmin to verify users.
            </Layout>
          );
    }

    return (
        <Layout
            pageTitle="Verify claim"
            pageDescription="Verify claim"
            pathname={VERIFY_CLAIM_PATHNAME}
        >
            <Modal opened={claimToVerify !== null} onClose={() => { setClaimToVerify(null); }} title="Confirmation" centered>
                { claimToVerify && (
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
                        )
                    })}
                </tbody>
            </Table>
          </ScrollArea>
        </Layout>
      );
}

export default VerifyClaim;