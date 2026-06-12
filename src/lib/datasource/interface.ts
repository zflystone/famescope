import type { RawPost, Person } from "@/types";

export interface DataSource {
  getPeople(): Promise<Person[]>;
  getRecentPosts(since?: Date): Promise<RawPost[]>;
  getPostsByPerson(personId: string, limit?: number): Promise<RawPost[]>;
}
