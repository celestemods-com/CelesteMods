import { Header, Text } from "@mantine/core";
import { NavLink } from "react-router-dom";
import { routes } from "../routerConfig";




export const AppHeader = (title: string) => {
  return (
    <Header height={100}>
      <Text>
        {`This is the ${title} page.`}
      </Text>
      <nav>
        <ul>
          {routes[0].children.map((pageRoot) => {
            return <li key={pageRoot.path}><NavLink to={pageRoot.path} style={({ isActive }) => isActive ? { fontWeight: 2 } : undefined}>{pageRoot.pathname}</NavLink></li>;
          })}
        </ul>
      </nav>
    </Header>
  )
}