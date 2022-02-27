import Amplify, { Auth, DataStore, Storage } from 'aws-amplify'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Post } from '../../src/API'
import { listPostsCustom } from '../../src/graphql/customeQueries'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'

import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid';

import { deleteImage, deletePost } from '../../src/graphql/mutations'
import { Post as PostModel } from '../../src/models'
import SearchBar from '../../src/components/Search'
import {
  deletePostAction,
  selectPosts,
  setListPost,
} from '../../src/redux/reducer/post'
import { useRouter } from 'next/router'
const base_url =
  'https://images.unsplash.com/photo-1645517976228-1ad46e10b3a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80'
const Posts = ({ data }: { data: Post[] }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const listPost = useSelector((state: any) => selectPosts(state))

  console.log('data post', listPost)

  // useEffect(() => {
  //   const subscription = DataStore.observe(PostModel).subscribe(msg => {
  //     console.log("Real time Post reload: " ,msg.model, msg.opType, msg.element);
  //   });
  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])
  useEffect(() => {
    console.log('Renew data', data)

    dispatch(setListPost(data as any))
  }, [data])

  return (
    <div>
      <button
        onClick={() => {
          router.push('/posts/create')
        }}
      >
        Create Post
      </button>

      <h1 style={{ textAlign: 'center' }}>List Post</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <SearchBar />
      </div>
      <Grid container spacing={2}>
        {/* <div style={{ margin: 10 }}> */}
          {listPost.length > 0 &&
            listPost.map((item: any) => {
              return <ListPost key={item.id} item={item} />
            })}
        {/* </div> */}
      </Grid>
    </div>
  )
}

const ListPost = ({ item }: { item: Post }) => {
  const dispatch = useDispatch()

  const [urlCheck, setUrlCheck] = useState<any[]>([])

  const formatNewUrl = (key: any) => {
    let promiseArray: any[] = []
    key.forEach((img: any) => {
      const pel = Storage.get(img.url)
      promiseArray.push(pel)
    })
    return promiseArray
  }

  const getURLImg: any = async (key: any) => {
    // console.log('KEY', key)

    Promise.all(formatNewUrl(key)).then((response: any) => {
      // console.log('result', response)
      setUrlCheck(response)
    })
    // setUrlCheck(newUrl)
  }

  const promiseDeleteImageStorage = (listImage: any) => {
    let promiseArray: any[] = []
    listImage.forEach((img: any) => {
      const pel = Storage.remove(img.url)
      promiseArray.push(pel)
    })
    return promiseArray
  }

  const promiseDeleteImageDB = (listImage: any) => {
    let promiseArray: any[] = []
    listImage.forEach((img: any) => {
      // const pel = Storage.remove(img.url)
      const pel = Amplify.API.graphql({
        query: deleteImage,
        variables: { input: { id: img.id } },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      promiseArray.push(pel)
    })
    return promiseArray
  }

  const deleteAllImages: any = async (listImage: any) => {
    // console.log('KEY', listImage)

    Promise.all(promiseDeleteImageStorage(listImage)).then((response: any) => {
      console.log('result delete img in storage', response)
    })

    Promise.all(promiseDeleteImageDB(listImage)).then((response: any) => {
      console.log('result delete img in database', response)
    })
  }

  const handleDeletePost = async (id: string) => {
    try {
      // Delete All Image in Post
      deleteAllImages(item.image?.items)

      await Amplify.API.graphql({
        query: deletePost,
        variables: { input: { id: id } },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })

      dispatch(deletePostAction(id))
    } catch (error) {
      console.error('ERROR DELETE', error)
    }
  }

  useEffect(() => {
    getURLImg(item.image?.items)
  }, [item])

  // console.log('NEW URL', urlCheck)

  return (
    <Grid item xs={4}>
    <div key={item.id}>
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
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.body}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">
            <Link href={`/posts/${item.id}`}>Detail</Link>
          </Button>
          <Button size="small" onClick={() => handleDeletePost(item.id)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </div>
  </Grid>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const list = await Amplify.API.graphql({ query: listPostsCustom })

  console.log('List post', list)

  return {
    props: {
      data: list.data?.listPosts?.items,
    },
  }
}

export default Posts
