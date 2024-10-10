// use/entities/user.entity.ts
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { bcrypt } from 'bcryptjs';

@Entity('user')
export class User {
  /**
   * 使用@PrimaryGeneratedColumn('uuid')创建一个主列id，
   * 该值将使用uuid自动生成。 Uuid 是一个独特的字符串;
   */
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 100 })
  username: string; // 用户名

  @Column({ length: 100 })
  nickname: string; //昵称

  @Column()
  password: string; // 密码

  @Column()
  avatar: string; //头像

  @Column()
  email: string;

  @Column('simple-enum', { enum: ['root', 'author', 'visitor'] })
  role: string; // 用户角色

  /**
   * 实现字段名驼峰转下划线命名,
   * createTime和updateTime字段转为下划线命名方式存入数据库，
   * 只需要在@Column装饰器中指定name属性；
   */
  @Column({
    name: 'create_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;

  @Column({
    name: 'update_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateTime: Date;

  /**
   * 使用 @BeforeInsert装饰器在实体对象插入数据时自动执行
   * 加密密码
   */
  @BeforeInsert()
  async encryptPwd() {
    this.password = await bcrypt.hashSync(this.password);
  }
}
