export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  audToTxt?: Maybe<AudText>;
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
