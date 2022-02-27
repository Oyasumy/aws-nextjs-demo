import { Box, Button, Modal, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Post } from '../API'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql'
import Amplify, { API, Auth, DataStore, Storage } from 'aws-amplify'

import styles from '../../styles/Post.module.css'
import { createImage, deleteImage, updatePost } from '../graphql/mutations'

interface UpdatePostType {
  openModal: boolean
  setOpenModal: Dispatch<SetStateAction<boolean>>
  post: Post
  urlCheck: any
  titleCurrent: string
  bodyCurrent: string
}
const UpdatePost = ({
  openModal,
  setOpenModal,
  post,
  urlCheck,
  titleCurrent,
  bodyCurrent,
}: UpdatePostType) => {
  const [selectedImage, setSelectedImage] = useState<[] | any>()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const removeImage = (index: number) => {
    console.log('IIV', index, selectedImage?.length)

    // let result: any = []

    if (selectedImage.length > 0) {
      //
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
    }
  }

  const uploadImages = (listImage: any) => {
    listImage.forEach((element: any) => {
      setSelectedImage((c: any) => [...c, element])
    })
  }

  const parseRawImgKey = (removeList: any[]) => {
    let result: any[] = []
    for (let index = 0; index < urlCheck.length; index++) {
      let check = removeList.includes(urlCheck[index])
      if (!check) {
        result.push(post.image?.items[index])
      }
    }
    return result
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

  const insertPromiseImageToStorage = (key: string, file: any) =>
    new Promise((resolve) => {
      console.log(`started inserting to storage ${key}`)

      resolve(
        Storage.put(key, file, {
          contentType: file.type,
        }),
      )
    })

  const sendAllImagesToStorage = async (
    listName: any,
    listImagesAdd: any[],
  ) => {
    if (listImagesAdd.length > 0) {
      listImagesAdd.forEach(async (image: any) => {
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
    listName.forEach(async (url: any) => {
      const imageInfo = await insertPromiseImageToPost(url, id)
      console.log(`Image add to ${imageInfo}`)
    })

    console.log('All Images were add')
  }

  const updatePostToAWS = async (post: any) => {
    const result: any = await API.graphql({
      query: updatePost,
      variables: { input: post },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })

    return result
  }

  const handleUpdatePost = async () => {
    try {
      if (title && body && selectedImage.length > 0) {
        // DELETE IMG OUT POST AND AWS
        let removeListImgCurrent = selectedImage.filter(
          (m: any) => typeof m == 'string',
        )
        if (removeListImgCurrent.length > 0) {
          let rawKey = parseRawImgKey(removeListImgCurrent)
          console.log('RAW KEY', rawKey)

          // Delete Img in S3
          await deleteAllImages(rawKey)
        }

        // ADD MORE IMG TO POST
        const listImagesAdd = selectedImage.filter(
          (m: any) => typeof m != 'string',
        )

        console.log(' list add', listImagesAdd)

        if (listImagesAdd.length > 0) {
          // First Storage all Image in AWS
          let listNameImage: any[] = []
          sendAllImagesToStorage(listNameImage, listImagesAdd)

          // Create Post
          const newPost = {
            title: title ?? '',
            body: body ?? '',
            id: post.id,
          }
          await updatePostToAWS(newPost)
            .then((result: any) => {
              console.log('result', result)

              const idPost = post.id
              // Add Image to Post

              sendAllImagesToPost(listNameImage, idPost)
            })
            .then(() => {
              confirm('Post Success!!')
            })
        }
      }
    } catch (error) {
      console.error('ERROR UPDATE', error)
      confirm('Post error!!')
    }
  }

  useEffect(() => {
    setSelectedImage(urlCheck)
    setTitle(titleCurrent)
    setBody(bodyCurrent)
    return () => {
      setTitle(titleCurrent)
      setBody(bodyCurrent)
      // setSelectedImage(urlCheck)
    }
  }, [urlCheck, post, titleCurrent, bodyCurrent])

  // console.log('LIST Image', selectedImage)

  return (
    <Modal
      open={openModal}
      onClose={() => setOpenModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Text in a modal
        </Typography>
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
                  <div key={item.name ?? index} style={{}}>
                    <Image
                      alt="not fount"
                      width={250}
                      height={300}
                      //   layout="fill"
                      objectFit="contain"
                      src={!item.name ? item : URL.createObjectURL(item)}
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
                  //   setSelectedImage(
                  //     event ? Object.values(event?.target?.files) : null,
                  //   )
                  uploadImages(
                    event ? Object.values(event?.target?.files) : null,
                  )
                }
              }}
            />
          </div>
          <div className={`container ${styles.buttonAction}`}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleUpdatePost()}
            >
              Update
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}

export default UpdatePost
