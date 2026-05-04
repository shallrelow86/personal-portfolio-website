import { defineType, defineField } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url' }),
    defineField({ name: 'liveUrl', title: 'Live URL', type: 'url' }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'importedFromGit',
      title: 'Imported from Git',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'gitRepoData',
      title: 'Git Repo Data',
      type: 'object',
      readOnly: true,
      fields: [
        { name: 'stars', type: 'number' },
        { name: 'forks', type: 'number' },
        { name: 'language', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'topics', type: 'array', of: [{ type: 'string' }] },
        { name: 'updatedAt', type: 'datetime' },
      ],
    }),
  ],
  orderings: [
    { title: 'Sort Order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
  ],
});
