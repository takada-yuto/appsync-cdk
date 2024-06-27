import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSTimestamp: { input: any; output: any; }
  AWSURL: { input: any; output: any; }
};

export type AddTodoInput = {
  title: Scalars['String']['input'];
};

export type AudText = {
  __typename?: 'AudText';
  text: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addTodo?: Maybe<Todo>;
  audToTxt: AudText;
  createDownloadPresignedUrl?: Maybe<PresignedUrl>;
  createUploadPresignedUrl?: Maybe<PresignedUrl>;
  deleteTodo?: Maybe<Scalars['Boolean']['output']>;
  toggleTodo?: Maybe<Todo>;
};


export type MutationAddTodoArgs = {
  addTodoInput: AddTodoInput;
};


export type MutationAudToTxtArgs = {
  presignedUrl: Scalars['String']['input'];
};


export type MutationCreateDownloadPresignedUrlArgs = {
  filename: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationCreateUploadPresignedUrlArgs = {
  filename: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationDeleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleTodoArgs = {
  toggleTodoInput: ToggleTodoInput;
};

export type PresignedUrl = {
  __typename?: 'PresignedUrl';
  bucket?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  presignedUrl?: Maybe<Scalars['AWSURL']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getTodos: Array<Todo>;
};

export type Todo = {
  __typename?: 'Todo';
  completed: Scalars['Boolean']['output'];
  createdAt: Scalars['AWSTimestamp']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type ToggleTodoInput = {
  completed: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type AddTodoMutationVariables = Exact<{
  addTodoInput: AddTodoInput;
}>;


export type AddTodoMutation = { __typename?: 'Mutation', addTodo?: { __typename?: 'Todo', id: string, title: string, completed: boolean, createdAt: any } | null };

export type AudToTxtMutationVariables = Exact<{
  presignedUrl: Scalars['String']['input'];
}>;


export type AudToTxtMutation = { __typename?: 'Mutation', audToTxt: { __typename?: 'AudText', text: string } };

export type CreateDownloadPresignedUrlMutationVariables = Exact<{
  filename: Scalars['String']['input'];
  id: Scalars['String']['input'];
}>;


export type CreateDownloadPresignedUrlMutation = { __typename?: 'Mutation', createDownloadPresignedUrl?: { __typename?: 'PresignedUrl', bucket?: string | null, key?: string | null, presignedUrl?: any | null } | null };

export type CreateUploadPresignedUrlMutationVariables = Exact<{
  filename: Scalars['String']['input'];
  id: Scalars['String']['input'];
}>;


export type CreateUploadPresignedUrlMutation = { __typename?: 'Mutation', createUploadPresignedUrl?: { __typename?: 'PresignedUrl', bucket?: string | null, key?: string | null, presignedUrl?: any | null } | null };

export type DeleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTodoMutation = { __typename?: 'Mutation', deleteTodo?: boolean | null };

export type GetTodosQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTodosQuery = { __typename?: 'Query', getTodos: Array<{ __typename?: 'Todo', id: string, title: string, completed: boolean, createdAt: any }> };

export type ToggleTodoMutationVariables = Exact<{
  toggleTodoInput: ToggleTodoInput;
}>;


export type ToggleTodoMutation = { __typename?: 'Mutation', toggleTodo?: { __typename?: 'Todo', id: string, title: string, completed: boolean, createdAt: any } | null };


export const AddTodoDocument = gql`
    mutation AddTodo($addTodoInput: AddTodoInput!) {
  addTodo(addTodoInput: $addTodoInput) {
    id
    title
    completed
    createdAt
  }
}
    `;
export type AddTodoMutationFn = Apollo.MutationFunction<AddTodoMutation, AddTodoMutationVariables>;

/**
 * __useAddTodoMutation__
 *
 * To run a mutation, you first call `useAddTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTodoMutation, { data, loading, error }] = useAddTodoMutation({
 *   variables: {
 *      addTodoInput: // value for 'addTodoInput'
 *   },
 * });
 */
export function useAddTodoMutation(baseOptions?: Apollo.MutationHookOptions<AddTodoMutation, AddTodoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTodoMutation, AddTodoMutationVariables>(AddTodoDocument, options);
      }
export type AddTodoMutationHookResult = ReturnType<typeof useAddTodoMutation>;
export type AddTodoMutationResult = Apollo.MutationResult<AddTodoMutation>;
export type AddTodoMutationOptions = Apollo.BaseMutationOptions<AddTodoMutation, AddTodoMutationVariables>;
export const AudToTxtDocument = gql`
    mutation AudToTxt($presignedUrl: String!) {
  audToTxt(presignedUrl: $presignedUrl) {
    text
  }
}
    `;
export type AudToTxtMutationFn = Apollo.MutationFunction<AudToTxtMutation, AudToTxtMutationVariables>;

/**
 * __useAudToTxtMutation__
 *
 * To run a mutation, you first call `useAudToTxtMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudToTxtMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audToTxtMutation, { data, loading, error }] = useAudToTxtMutation({
 *   variables: {
 *      presignedUrl: // value for 'presignedUrl'
 *   },
 * });
 */
export function useAudToTxtMutation(baseOptions?: Apollo.MutationHookOptions<AudToTxtMutation, AudToTxtMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudToTxtMutation, AudToTxtMutationVariables>(AudToTxtDocument, options);
      }
export type AudToTxtMutationHookResult = ReturnType<typeof useAudToTxtMutation>;
export type AudToTxtMutationResult = Apollo.MutationResult<AudToTxtMutation>;
export type AudToTxtMutationOptions = Apollo.BaseMutationOptions<AudToTxtMutation, AudToTxtMutationVariables>;
export const CreateDownloadPresignedUrlDocument = gql`
    mutation CreateDownloadPresignedUrl($filename: String!, $id: String!) {
  createDownloadPresignedUrl(filename: $filename, id: $id) {
    bucket
    key
    presignedUrl
  }
}
    `;
export type CreateDownloadPresignedUrlMutationFn = Apollo.MutationFunction<CreateDownloadPresignedUrlMutation, CreateDownloadPresignedUrlMutationVariables>;

/**
 * __useCreateDownloadPresignedUrlMutation__
 *
 * To run a mutation, you first call `useCreateDownloadPresignedUrlMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDownloadPresignedUrlMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDownloadPresignedUrlMutation, { data, loading, error }] = useCreateDownloadPresignedUrlMutation({
 *   variables: {
 *      filename: // value for 'filename'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCreateDownloadPresignedUrlMutation(baseOptions?: Apollo.MutationHookOptions<CreateDownloadPresignedUrlMutation, CreateDownloadPresignedUrlMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDownloadPresignedUrlMutation, CreateDownloadPresignedUrlMutationVariables>(CreateDownloadPresignedUrlDocument, options);
      }
export type CreateDownloadPresignedUrlMutationHookResult = ReturnType<typeof useCreateDownloadPresignedUrlMutation>;
export type CreateDownloadPresignedUrlMutationResult = Apollo.MutationResult<CreateDownloadPresignedUrlMutation>;
export type CreateDownloadPresignedUrlMutationOptions = Apollo.BaseMutationOptions<CreateDownloadPresignedUrlMutation, CreateDownloadPresignedUrlMutationVariables>;
export const CreateUploadPresignedUrlDocument = gql`
    mutation CreateUploadPresignedUrl($filename: String!, $id: String!) {
  createUploadPresignedUrl(filename: $filename, id: $id) {
    bucket
    key
    presignedUrl
  }
}
    `;
export type CreateUploadPresignedUrlMutationFn = Apollo.MutationFunction<CreateUploadPresignedUrlMutation, CreateUploadPresignedUrlMutationVariables>;

/**
 * __useCreateUploadPresignedUrlMutation__
 *
 * To run a mutation, you first call `useCreateUploadPresignedUrlMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUploadPresignedUrlMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUploadPresignedUrlMutation, { data, loading, error }] = useCreateUploadPresignedUrlMutation({
 *   variables: {
 *      filename: // value for 'filename'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCreateUploadPresignedUrlMutation(baseOptions?: Apollo.MutationHookOptions<CreateUploadPresignedUrlMutation, CreateUploadPresignedUrlMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUploadPresignedUrlMutation, CreateUploadPresignedUrlMutationVariables>(CreateUploadPresignedUrlDocument, options);
      }
export type CreateUploadPresignedUrlMutationHookResult = ReturnType<typeof useCreateUploadPresignedUrlMutation>;
export type CreateUploadPresignedUrlMutationResult = Apollo.MutationResult<CreateUploadPresignedUrlMutation>;
export type CreateUploadPresignedUrlMutationOptions = Apollo.BaseMutationOptions<CreateUploadPresignedUrlMutation, CreateUploadPresignedUrlMutationVariables>;
export const DeleteTodoDocument = gql`
    mutation DeleteTodo($id: ID!) {
  deleteTodo(id: $id)
}
    `;
export type DeleteTodoMutationFn = Apollo.MutationFunction<DeleteTodoMutation, DeleteTodoMutationVariables>;

/**
 * __useDeleteTodoMutation__
 *
 * To run a mutation, you first call `useDeleteTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTodoMutation, { data, loading, error }] = useDeleteTodoMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTodoMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTodoMutation, DeleteTodoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTodoMutation, DeleteTodoMutationVariables>(DeleteTodoDocument, options);
      }
export type DeleteTodoMutationHookResult = ReturnType<typeof useDeleteTodoMutation>;
export type DeleteTodoMutationResult = Apollo.MutationResult<DeleteTodoMutation>;
export type DeleteTodoMutationOptions = Apollo.BaseMutationOptions<DeleteTodoMutation, DeleteTodoMutationVariables>;
export const GetTodosDocument = gql`
    query GetTodos {
  getTodos {
    id
    title
    completed
    createdAt
  }
}
    `;

/**
 * __useGetTodosQuery__
 *
 * To run a query within a React component, call `useGetTodosQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTodosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTodosQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTodosQuery(baseOptions?: Apollo.QueryHookOptions<GetTodosQuery, GetTodosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
      }
export function useGetTodosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTodosQuery, GetTodosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
        }
export function useGetTodosSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTodosQuery, GetTodosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
        }
export type GetTodosQueryHookResult = ReturnType<typeof useGetTodosQuery>;
export type GetTodosLazyQueryHookResult = ReturnType<typeof useGetTodosLazyQuery>;
export type GetTodosSuspenseQueryHookResult = ReturnType<typeof useGetTodosSuspenseQuery>;
export type GetTodosQueryResult = Apollo.QueryResult<GetTodosQuery, GetTodosQueryVariables>;
export const ToggleTodoDocument = gql`
    mutation ToggleTodo($toggleTodoInput: ToggleTodoInput!) {
  toggleTodo(toggleTodoInput: $toggleTodoInput) {
    id
    title
    completed
    createdAt
  }
}
    `;
export type ToggleTodoMutationFn = Apollo.MutationFunction<ToggleTodoMutation, ToggleTodoMutationVariables>;

/**
 * __useToggleTodoMutation__
 *
 * To run a mutation, you first call `useToggleTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTodoMutation, { data, loading, error }] = useToggleTodoMutation({
 *   variables: {
 *      toggleTodoInput: // value for 'toggleTodoInput'
 *   },
 * });
 */
export function useToggleTodoMutation(baseOptions?: Apollo.MutationHookOptions<ToggleTodoMutation, ToggleTodoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleTodoMutation, ToggleTodoMutationVariables>(ToggleTodoDocument, options);
      }
export type ToggleTodoMutationHookResult = ReturnType<typeof useToggleTodoMutation>;
export type ToggleTodoMutationResult = Apollo.MutationResult<ToggleTodoMutation>;
export type ToggleTodoMutationOptions = Apollo.BaseMutationOptions<ToggleTodoMutation, ToggleTodoMutationVariables>;
export const namedOperations = {
  Query: {
    GetTodos: 'GetTodos'
  },
  Mutation: {
    AddTodo: 'AddTodo',
    AudToTxt: 'AudToTxt',
    CreateDownloadPresignedUrl: 'CreateDownloadPresignedUrl',
    CreateUploadPresignedUrl: 'CreateUploadPresignedUrl',
    DeleteTodo: 'DeleteTodo',
    ToggleTodo: 'ToggleTodo'
  }
}