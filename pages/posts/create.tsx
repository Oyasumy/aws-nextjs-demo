import { Button } from '@mui/material'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import Amplify, {
  Storage,
  API,
  withSSRContext,
  Auth,
  DataStore,
} from 'aws-amplify'
import { v4 as uuidv4 } from 'uuid'

import styles from '../../styles/Post.module.css'
import { createImage, createPost } from '../../src/graphql/mutations'
import { getPost, listPosts } from '../../src/graphql/queries'
import config from '../../src/aws-exports'
import { useUser } from '../../src/context/AuthContext'
import { CreateImageMutation, Post } from '../../src/API'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'
import { listPostsCustom } from '../../src/graphql/customeQueries'
import { useRouter } from 'next/router'
// Storage.configure({
//   region: config.aws_appsync_region,
//   bucket: config.aws_user_files_s3_bucket,
//   identityPoolId: config.aws_user_pools_id,
//   // level: "protected",
// })

const PostManager = () => {
  const [selectedImage, setSelectedImage] = useState<[] | any>()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const { user } = useUser()

  console.log('USER', user)

  const insertPromiseImageToStorage = (key: string, file: any) =>
    new Promise((resolve) => {
      console.log(`started inserting to storage ${key}`)

      resolve(
        Storage.put(key, file, {
          contentType: file.type,
        }),
      )
    })

  const sendAllImagesToStorage = async (listName: any) => {
    if (selectedImage && selectedImage.length > 0) {
      selectedImage.forEach(async (image: any) => {
        // Random file name
        const fileName = uuidv4()
        listName.push(fileName)

        const imageInfo = await insertPromiseImageToStorage(fileName, image)
        console.log(`Image sent to ${imageInfo}`)
      })

      console.log('All Images were sent')
    }
  }

  const insertPromiseImageToPost = (url: string, id: string) =>
    new Promise((resolve) => {
      console.log(`started inserting img to post ${url} -id ${id}`)

      // Add Image to Post
      const image = {
        postImageId: id,
        url: url,
      }
      resolve(
        API.graphql({
          query: createImage,
          variables: { input: image },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        }),
      )
    })

  const sendAllImagesToPost = async (listName: any, id: string) => {
    if (selectedImage && selectedImage.length > 0) {
      listName.forEach(async (url: any) => {
        const imageInfo = await insertPromiseImageToPost(url, id)
        console.log(`Image add to ${imageInfo}`)
      })

      console.log('All Images were add')
    }
  }

  const AddPostToAWS = async (post: any) => {
    const result: any = await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })

    return result
  }

  const AddPost = async () => {
    console.log('data img', selectedImage)

    try {
      if (selectedImage && selectedImage.length > 0) {
        // First Storage all Image in AWS
        let listNameImage: any[] = []
        sendAllImagesToStorage(listNameImage)

        // Create Post
        const post = {
          title: title ?? '',
          body: body ?? '',
        }
        await AddPostToAWS(post)
          .then((result: any) => {
            console.log('result', result)

            const idPost = result?.data?.createPost?.id
            // Add Image to Post

            sendAllImagesToPost(listNameImage, idPost)
          })
          .then(() => {
            confirm('Post Success!!')
          })
      }
    } catch (error) {
      console.log('ERROR ,', error)
      confirm('Post Failed!!')
    }
  }
  useEffect(() => {
    getPostAPI()
    async function getPostAPI() {
      // const list = await client.query({ query: gql(listPosts) })
      try {
        // const list = (await  API.graphql({ query: listPosts , authMode: 'AMAZON_COGNITO_USER_POOLS'})) as {
        const list = (await Amplify.API.graphql({
          query: listPostsCustom,
        })) as {
          data: Post[]
          errors: any[]
        }

        // DataStore.query()
        console.log('List post', list)
      } catch (error) {
        console.error('Error', error)
      }
    }
  }, [])

  const removeImage = (index: number) => {
    console.log('IIV', index, selectedImage?.length)

    // let result: any = []

    if (selectedImage.length > 0) {
      if (index == 0) {
        setSelectedImage([...selectedImage.splice(index + 1)])
      } else if (index == selectedImage.length - 1) {
        setSelectedImage([...selectedImage.splice(0, index)])
      } else {
        setSelectedImage([
          ...selectedImage.slice(0, index),
          ...selectedImage.slice(index + 1),
        ])
      }
      // console.log('result remove', result)

      // setSelectedImage(result)
    }
  }

  console.log('select image', selectedImage)

  return (
    <div className={`${styles.container}`}>
      <div>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="user name">Title</label>
          <input
            type="text"
            name="title"
            id=""
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
          />
        </div>
        <div className={`${styles.boxInput}`}>
          <label htmlFor="user name">Body</label>
          <input
            type="text"
            name="body"
            id=""
            value={body}
            onChange={(e: any) => setBody(e.target.value)}
          />
        </div>
      </div>
      <h1>{`Upload and Display Image usign React Hook's`}</h1>
      <div className={`container ${styles.imageAction}`}>
        {selectedImage &&
          selectedImage.length > 0 &&
          selectedImage.map((item: any, index: any) => {
            return (
              <div key={item.name} style={{}}>
                <Image
                  alt="not fount"
                  width={250}
                  height={300}
                  //   layout="fill"
                  objectFit="contain"
                  src={URL.createObjectURL(item)}
                  // src={URL.createObjectURL(selectedImage[0])}
                />
                <br />
                <button onClick={() => removeImage(index)}>Remove</button>
              </div>
            )
          })}

        <br />
        <input
          type="file"
          name="myImage"
          multiple
          onChange={(event: any) => {
            if (event && event.target) {
              console.log(event?.target?.files)
              setSelectedImage(
                event ? Object.values(event?.target?.files) : null,
              )
            }
          }}
        />
      </div>
      <div className={`container ${styles.buttonAction}`}>
        <Button variant="outlined" color="error" onClick={() => AddPost()}>
          Success
        </Button>
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      data: null,
    },
  }
}

export default PostManager
