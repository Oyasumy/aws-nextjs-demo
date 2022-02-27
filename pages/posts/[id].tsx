import { GetStaticPaths, GetStaticProps } from 'next'
import Amplify, { Storage } from 'aws-amplify'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Post } from '../../src/API'
import {
  getPostCustom,
  listPostsCustom,
} from '../../src/graphql/customeQueries'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'

import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { getPost } from '../../src/graphql/queries'
import { useUser } from '../../src/context/AuthContext'
import { useRouter } from 'next/router'
import { Box, Modal } from '@mui/material'
import UpdatePost from '../../src/components/UpdatePost'

const PostDetail = ({ item }: { item: Post }) => {
  const [urlCheck, setUrlCheck] = useState<any[]>([])

  const [openModal, setOpenModal] = useState(false)
  const { user } = useUser()

  const router = useRouter()

  const formatNewUrl = (key: any) => {
    let promiseArray: any[] = []
    key.forEach((img: any) => {
      const pel = Storage.get(img.url)
      promiseArray.push(pel)
    })
    return promiseArray
  }

  const getURLImg: any = async (key: any) => {
    console.log('KEY', key)

    if (key) {
      Promise.all(formatNewUrl(key)).then((response: any) => {
        console.log('result', response)
        setUrlCheck(response)
      })
    }
    // setUrlCheck(newUrl)
  }

  useEffect(() => {
    getURLImg(item?.image?.items)
  }, [item])

  console.log('Item', item)

  return (
    <>
      <button
        onClick={() => {
          router.back()
        }}
      >
        Back to list
      </button>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Card sx={{ maxWidth: 345 }}>
          {/* <CardMedia
          component="img"
          height="140"
          image="/static/images/cards/contemplative-reptile.jpg"
          alt="green iguana"
        /> */}
          <div style={{ display: 'flex' }}>
            {urlCheck.length > 0 &&
              urlCheck.map((img: any) => {
                return (
                  <Image
                    key={img}
                    alt="not fount"
                    width={250}
                    height={300}
                    //   layout="fill"
                    objectFit="contain"
                    src={img}
                    //   src={item.image ? getURLImg(item.image) : 'https://images.unsplash.com/photo-1645517976228-1ad46e10b3a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80'}
                  />
                )
              })}
          </div>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item?.body}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => setOpenModal(true)}>
              Update
            </Button>
            {/* <Button size="small">Delete</Button> */}
          </CardActions>
        </Card>
      </div>
     <UpdatePost openModal={openModal} setOpenModal={setOpenModal} post={item} urlCheck={urlCheck} setUrlCheck={setUrlCheck} titleCurrent={item.title} bodyCurrent={item.body} />
    </>
  )
}

// export const getStaticPaths: GetStaticPaths = async (ctx) => {
//   return {
//     props: {
//       params: [],
//       data: null,
//     },
//   }
// }
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx
  console.log('CTX', query)

  if (query?.id) {
    const post = await Amplify.API.graphql({
      query: getPostCustom,
      variables: { id: query?.id },
      //   authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })

    console.log('Post detail- ', post)
    // const list = await Amplify.API.graphql({ query: listPostsCustom })

    // console.log('List post', list)
    return {
      props: {
        item: post.data.getPost,
      },
    }
  } else {
    return {
      props: {
        data: [],
      },
    }
  }
}

export default PostDetail
