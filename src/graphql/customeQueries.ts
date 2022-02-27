export const listPostsCustom = /* GraphQL */ `
   query ListPosts($filter: ModelPostFilterInput, $limit: Int, $nextToken: String) {
      listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
         items {
            body
            createdAt
            id
            owner
            title
            image {
               items {
                  createdAt
                  id
                  owner
                  postImageId
                  url
               }
            }
         }
         nextToken
      }
   }
`;

export const getPostCustom = /* GraphQL */ `
   query GetPost($id: ID!) {
      getPost(id: $id) {
         id
         title
         comments {
            items {
               id
               content
               createdAt
               updatedAt
               postCommentsId
               owner
            }
            nextToken
         }
         body
         image {
            items {
               id
               url
               createdAt
               updatedAt
               postImageId
               owner
            }
            nextToken
         }
         createdAt
         updatedAt
         owner
      }
   }
`;

export const filterListPostsWithTitle = /* GraphQL */ `
   query ListPosts($filter: ModelPostFilterInput, $limit: Int, $nextToken: String) {
      listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
         items {
            body
            createdAt
            id
            owner
            title
            image {
               items {
                  createdAt
                  id
                  owner
                  postImageId
                  url
               }
            }
         }
         nextToken
      }
   }
`;

