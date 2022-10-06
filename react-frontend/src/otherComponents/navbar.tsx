import { Aside, Text } from "@mantine/core";




export const AppNavbar = ({title}: {title: string}) => {
  return (
    <Aside>
      <Text>
        Currently on {title} page.
      </Text>
    </Aside>
  )
}