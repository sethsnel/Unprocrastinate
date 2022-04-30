import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'

import Container from '../components/container'
import PostBody from '../components/post-body'
import Header from '../components/header'
import PostHeader from '../components/post-header'
import Layout from '../components/layout'
import { getPostBySlug, getPostSlugs } from '../lib/api'
import PostTitle from '../components/post-title'
import { CMS_NAME } from '../lib/constants'
import markdownToHtml from '../lib/markdownToHtml'

export default function Post({ post, morePosts, preview }) {
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Laden…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>
                  {post.title} | {CMS_NAME}
                </title>
                {(post?.ogImage?.url) && (<meta property="og:image" content={post.ogImage.url} />)}
              </Head>
              <PostHeader
                title={post?.title}
                coverImage={post?.coverImage}
                date={post?.date}
                author={post?.author}
              />
              <PostBody content={post.content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const previousSlug = context.req.cookies['current-slug']

  const slugs = getPostSlugs()
  remove(slugs, previousSlug)
  const randomSlugIndex = Math.floor(Math.random() * slugs.length)

  context.res.setHeader('set-cookie', [`current-slug=${slugs[randomSlugIndex]}`])
  const post = getPostBySlug(slugs[randomSlugIndex], [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

function remove(array, search_term) {
  var index = array.indexOf(search_term);    // <-- Not supported in <IE9

  if (index !== -1) {
      array.splice(index, 1);
  }
}
