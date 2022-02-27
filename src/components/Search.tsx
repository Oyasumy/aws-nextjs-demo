import { Box, Button, TextField } from '@mui/material'
import { useState } from 'react'
import { Amplify, graphqlOperation } from 'aws-amplify'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'
import { useDispatch, useSelector } from 'react-redux'

import {
  filterListPostsWithTitle,
  listPostsCustom,
} from '../graphql/customeQueries'
import { setListPost } from '../redux/reducer/post'
const SearchBar = () => {
  const [searchValue, setSearchValue] = useState<string>('')

  const dispatch = useDispatch()

  const handleSearch = async () => {
    if (searchValue) {
      // const result = await Amplify.API.graphql({
      //   query: listPostsCustom,

      //   variables: { filter: { title: { contains: searchValue } } },
      //   authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      // })
      const result = await Amplify.API.graphql(
        graphqlOperation(listPostsCustom, {
          limit: 20,
          filter: { title: { contains: searchValue } },
        }),
      )

      console.log('RESULT SEARCH', result)

      dispatch(setListPost(result.data.listPosts.items))
    }
  }

  return (
    <div style={{ alignSelf: 'center' }}>
      <Box>
        <TextField
          value={searchValue}
          onChange={(e: any) => setSearchValue(e.target.value)}
          label="Search Title"
          color="secondary"
          focused
          fullWidth
        />
      </Box>
      <Box
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          marginTop: 10,
        }}
      >
        <Button
          disabled={!searchValue}
          variant="contained"
          onClick={() => handleSearch()}
        >
          Send
        </Button>
      </Box>
    </div>
  )
}
export default SearchBar
