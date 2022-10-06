import { Header, Text } from "@mantine/core"




export const AppHeader = (title: string) => {
  return (
    <Header height={100}>
      <Text>
        {title}
      </Text>
    </Header>
  )
}