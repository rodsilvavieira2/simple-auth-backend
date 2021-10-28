import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { User } from './user';

@Entity('user_address')
export class UserAddress {
  @PrimaryColumn()
  id: string;

  @Column()
  id_user: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column()
  state: string;

  @Column()
  district: string;

  @Column()
  city: string;

  @Column()
  house_number: number;

  @Column()
  postal_code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}
