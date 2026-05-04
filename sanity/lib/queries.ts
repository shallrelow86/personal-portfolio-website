import { groq } from 'next-sanity';

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]`;

export const PROFILE_QUERY = groq`*[_type == "profile"][0]`;

export const FEATURED_PROJECTS_QUERY = groq`*[_type == "project" && featured == true] | order(sortOrder asc) {
  _id, title, slug, coverImage, description, techStack, githubUrl, liveUrl
}`;

export const ALL_PROJECTS_QUERY = groq`*[_type == "project"] | order(sortOrder asc) {
  _id, title, slug, coverImage, description, techStack, githubUrl, liveUrl
}`;

export const PROJECT_BY_SLUG_QUERY = groq`*[_type == "project" && slug.current == $slug][0] {
  _id, title, slug, coverImage, description, body, screenshots, techStack, githubUrl, liveUrl, gitRepoData
}`;

export const LATEST_POSTS_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0..2] {
  _id, title, slug, coverImage, excerpt, tags, publishedAt
}`;

export const ALL_POSTS_QUERY = groq`*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, coverImage, excerpt, tags, publishedAt
}`;

export const POST_BY_SLUG_QUERY = groq`*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, coverImage, body, excerpt, tags, publishedAt
}`;

export const COMMENTS_BY_POST_QUERY = groq`*[_type == "comment" && post._ref == $postId && status == "approved"] | order(createdAt desc) {
  _id, authorName, body, createdAt
}`;

export const ALL_PROJECT_SLUGS_QUERY = groq`*[_type == "project" && defined(slug.current)][].slug.current`;

export const ALL_POST_SLUGS_QUERY = groq`*[_type == "post" && defined(slug.current)][].slug.current`;

export const ALL_PROJECT_TECH_STACKS_QUERY = groq`*[_type == "project" && defined(techStack)].techStack[]`;
