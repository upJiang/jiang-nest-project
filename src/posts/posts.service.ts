import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './entities/posts.entity';

export interface PostsRo {
  list: PostsEntity[];
  count: number;
  totalPages: number;
  currentPage: number;
}
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 创建文章
  async create(post: Partial<PostsEntity>): Promise<PostsEntity> {
    const { title } = post;
    if (!title) {
      throw new HttpException('缺少文章标题', 401);
    }
    const doc = await this.postsRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', 401);
    }
    return await this.postsRepository.save(post);
  }

  // 获取文章列表
  async findAll(page: number = 1, pageSize: number = 10): Promise<PostsRo> {
    const [posts, totalCount] = await this.postsRepository.findAndCount({
      skip: (page - 1) * pageSize, // 分页偏移量
      take: pageSize, // 每页显示的记录数
      order: { create_time: 'DESC' },
    });

    return {
      list: posts,
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize), // 计算总页数
      currentPage: page, // 当前页
    };
  }

  // 获取指定文章
  async findById(id): Promise<PostsEntity> {
    return await this.postsRepository.findOne({ where: { id } });
  }

  // 更新文章
  async updateById(id, post): Promise<PostsEntity> {
    const existPost = await this.postsRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401);
    }
    const updatePost = this.postsRepository.merge(existPost, post);
    return this.postsRepository.save(updatePost);
  }

  // 刪除文章
  async remove(id) {
    const existPost = await this.postsRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401);
    }
    return await this.postsRepository.remove(existPost);
  }
}
