import { Stack, NavLink } from "@mantine/core";
import Link from "next/link";




type NavbarChild = {
    label: string;
    pathname: string;
};

export type NavbarProps = {
    pathname: string;
    pages: [NavbarChild, ...NavbarChild[]];
};




export function Navbar({
    pathname,
    pages,
}: NavbarProps) {
    return (
        <Stack>
            {pages.map(
                (page) => {
                    return (
                        <NavLink
                            key={page.label}
                            label={page.label}
                            active={pathname === page.pathname}
                            component={Link}
                            href={page.pathname}
                        />
                    );
                }
            )}
        </Stack>
    );
};