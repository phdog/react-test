import React, { useEffect, useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { sortableContainer, sortableElement } from 'react-sortable-hoc'
import path from 'ramda/es/path'
import pathOr from 'ramda/es/pathOr'
import findIndex from 'ramda/es/findIndex'
import propEq from 'ramda/es/propEq'
import { useQuery } from '@apollo/client'
import arrayMove from 'array-move'

import postQuery from 'GraphQL/Queries/post.graphql'
import postsQuery from 'GraphQL/Queries/posts.graphql'
import { ROOT, POST } from 'Router/routes'

import {
  Back,
  Column,
  Container,
  PostAuthor,
  PostBody,
  PostComment,
  PostContainer,
} from './styles'

const SortableContainer = sortableContainer(({ children }) => (
  <div>{children}</div>
))

const SortableItem = sortableElement(({ value }) => (
  <PostComment mb={2}>{value}</PostComment>
))

function Post() {
  const [comments, setComments] = useState([])
  const history = useHistory()
  const {
    params: { postId },
  } = useRouteMatch()

  const handleClick = () => history.push(ROOT)

  const handleSortEnd = ({ oldIndex, newIndex }) => {
    setComments(arrayMove(comments, oldIndex, newIndex,))
  }

  const { data, loading } = useQuery(postQuery, { variables: { id: postId }})
  const posts = pathOr([], ['data', 'posts', 'data'], useQuery(postsQuery))

  const post = data?.post

  const handleSkip = (direction) => (e) => {
    const idx = findIndex(propEq('id', postId), posts)
    const newId = path([idx + direction, 'id'], posts)
    if (newId) {
      history.push(POST(newId));
    }    
  }

  useEffect(() => {
    setComments(post?.comments?.data || [])
  }, [post])

  return (
    <Container>
      <Column>
        <Back onClick={handleClick}>Back</Back>
      </Column>
      {loading ? (
        'Loading...'
      ) : (
        <>
          <Column>
            <h4>Need to add next/previous links</h4>
            <PostContainer key={post.id}>
              <h3>{post.title}</h3>
              <PostAuthor>by {post.user.name}</PostAuthor>
              <PostBody mt={2}>{post.body}</PostBody>
            </PostContainer>
            <div>
              <span onClick={handleSkip(-1)}>Prev</span>
              <span> | </span>
              <span onClick={handleSkip(1)}>Next</span>
            </div>
          </Column>

          <Column>
            <h4>Incorrect sorting</h4>
            Comments:
            <SortableContainer onSortEnd={handleSortEnd}>
              {comments.map((comment, index) => (
                <SortableItem
                  index={index}
                  key={comment.id}
                  mb={3}
                  value={comment.body}
                />
              ))}
            </SortableContainer>
          </Column>
        </>
      )}
    </Container>
  )
}

export default Post
