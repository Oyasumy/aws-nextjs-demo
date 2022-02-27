import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../API";
import type { RootState } from "../store";

interface PostType {
   body: string;
   createdAt: Date;
   id: string;
   owner: string;
   title: string;
   image: Image;
}

interface Image {
   items: Item[];
}

interface Item {
   createdAt: Date;
   id: string;
   owner: string;
   postImageId: string;
   url: string;
}

// Define a type for the slice state


// Define the initial state using that type
const initialState: Post[] = [];

export const postSlice = createSlice({
   name: "poster",
   // `createSlice` will infer the state type from the `initialState` argument
   initialState,
   reducers: {
      addPostAction: (state, action: PayloadAction<Post>) => {
         //  state.value += 1;
         state.concat(action.payload);
      },
      updatePostAction: (state, action: PayloadAction<Post>) => {
         //  state.value -= 1;
      },
      // Use the PayloadAction type to declare the contents of `action.payload`
      deletePostAction: (state, action: PayloadAction<string>) => {
         //  state.value += action.payload;
         return state.filter((post: Post) => post.id !== action.payload);
      },
      setListPost: (state, action: PayloadAction<Post[]>) => {
        console.log("SET LIST POST REDUCER",action);
        
         return state = action.payload;
      },
   },
});

export const { addPostAction, updatePostAction, deletePostAction, setListPost } = postSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectPosts = (state: RootState) => state.poster;

export default postSlice.reducer;
