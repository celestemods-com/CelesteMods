import { Button, createStyles, LoadingOverlay, Modal, ScrollArea, Stack, Table } from "@mantine/core";
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
        claimingUser: string,
        claimedUser: string;
    } | null>(null);


    const utils = api.useUtils();

    const onSuccess = async () => {
        await Promise.all([
            utils.user.userClaim.invalidate()
        ]);

        setClaimToVerify(null);
    };

    const verifyUserClaimMutation = api.user.userClaim.verify.useMutation({ onSuccess });
    const rejectUserClaimMutation = api.user.userClaim.delete.useMutation({ onSuccess });


    const { classes } = useStyles();


    const isLoading = status === "loading";

    const isUserPermitted = !isLoading && sessionData !== null && isPermitted(sessionData.user.permissions, ADMIN_PERMISSION_STRINGS);


    return (
        <Layout
            pageTitle={PAGE_TITLE}
            pageDescription={PAGE_DESCRIPTION}
            pathname={VERIFY_CLAIM_PATHNAME}
        >
            <Modal
                opened={isLoading && claimToVerify !== null}    // TODO!!!: see if `status` can be referenced here directly. TypeScript threw an error here due to an unexpectedly narrowed type.
                onClose={() => { setClaimToVerify(null); }}
                title="Verify Claim"
                centered
            >
                {claimToVerify && (
                    <Stack align="flex-end">
                        <p>
                            Verify claim {claimToVerify.id}? {claimToVerify.claimingUser} is claiming {claimToVerify.claimedUser}
                        </p>
                        <Button
                            onClick={() => { verifyUserClaimMutation.mutate({ id: claimToVerify.id }); }}    //TODO!!!: style both buttons to be clearly differentiated
                        >
                            Verify
                        </Button>
                        <Button
                            onClick={() => { rejectUserClaimMutation.mutate({ id: claimToVerify.id }); }}
                            color="red" //TODO!!!: style both buttons to be clearly differentiated
                        >
                            Reject
                        </Button>
                    </Stack>
                )}
            </Modal>
            <LoadingOverlay
                visible={isLoading}
                color="rgba(0, 0, 0, 0.5)"
            >
                {isUserPermitted ? (
                    <ScrollArea
                        offsetScrollbars
                        className={classes.scrollArea}
                    >
                        <h1>User Claims</h1>
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
                                                        Verify
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </Table>
                    </ScrollArea>
                ) : (
                    <Layout
                        pageTitle={PAGE_TITLE}
                        pageDescription={PAGE_DESCRIPTION}
                        pathname={VERIFY_CLAIM_PATHNAME}
                    >
                        <p>You do not have permission to view this page.</p>
                    </Layout>
                )}
            </LoadingOverlay>
        </Layout>
    );
};

export default VerifyClaim;