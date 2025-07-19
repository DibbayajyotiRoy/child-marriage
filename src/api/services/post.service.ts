import { BaseApiService } from '../base';
import { endpoints } from '../endpoints';
import { Post } from '@/types';

// This matches the backend Post entity, excluding the ID
export interface CreatePostRequest {
  postName: string;
  department: 'POLICE' | 'DICE' | 'ADMINISTRATION';
  rank: number;
}

export class PostService extends BaseApiService {
  /**
   * Retrieves all posts from the API.
   */
  async getAll(): Promise<Post[]> {
    return this.get<Post[]>(endpoints.posts.getAll());
  }

  /**
   * Creates a new post.
   */
  async create(request: CreatePostRequest): Promise<Post> {
    return this.post<Post>(endpoints.posts.create(), request);
  }
}

export const postService = new PostService();