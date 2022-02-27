// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Post, Comment, Image } = initSchema(schema);

export {
  Post,
  Comment,
  Image
};