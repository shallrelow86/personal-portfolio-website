import { eq } from "drizzle-orm";
import { schema } from "./db";

export const publishedPostFilter = eq(schema.post.status, "published");
