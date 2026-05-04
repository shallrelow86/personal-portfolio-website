import { defineType, defineField } from 'sanity';

export const comment = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'authorEmail',
      title: 'Author Email',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      validation: (rule) => rule.required().max(2000),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Spam', value: 'spam' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    { title: 'Newest', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
});
