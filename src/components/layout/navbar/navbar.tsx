import { Stack } from "@mantine/core";
import { NavLink, type NavLinkData } from "./navLink";




export type NavbarProps = {
    pathname: string;
    pages: [NavLinkData, ...NavLinkData[]];
};




export const Navbar = ({ pathname, pages }: NavbarProps) => {
    return (
        <nav>
            <Stack spacing="xs" align="end">
                {pages.map(
                    (page, i) => {
                        return (
                            <NavLink
                                key={i}
                                label={page.label}
                                pathname={page.pathname}
                                active={pathname === page.pathname}
                            />
                        );
                    }
                )}
            </Stack>
        </nav>
    );
};