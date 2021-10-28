import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { User } from './user';

@Entity()
export class Coupons {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  status: boolean;

  @Column()
  maximum_price: number;

  @Column()
  discount: number;

  @ManyToMany(() => User)
  @JoinTable()
  user: User[];

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}
