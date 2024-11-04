import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NV_Users {
  // id为主键并且自动递增
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
