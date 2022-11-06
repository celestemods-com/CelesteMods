import { Header, Text, List } from "@mantine/core";
import { NavLink } from "react-router-dom";
import { routes } from "../routerConfig";




export const AppHeader = (title: string) => {
  return (
    <Header height={150}>
      <Text>
        {`This is the ${title} page.`}
      </Text>
      <nav>
        <List type="unordered" center>
          {routes[0].children.map((pageRoot) => {
            return <List.Item key={pageRoot.path}>
              <NavLink to={pageRoot.path} style={({ isActive }) => isActive ? { fontWeight: 2 } : undefined}>
                {pageRoot.pathname}
              </NavLink>
            </List.Item>;
          })}
        </List>
      </nav>
    </Header>
  )
}