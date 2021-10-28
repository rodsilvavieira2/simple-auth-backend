import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { User } from '.';
import { UserPhoneTypes } from './user_phone_types';

@Entity('user_phones')
export class UserPhone {
  @PrimaryColumn()
  id: string;

  @Column()
  id_user_phone_types: string;

  @Column()
  id_user: string;

  @ManyToOne(() => UserPhoneTypes)
  @JoinColumn({ name: 'id_user_phone_types' })
  userPhoneTypes: UserPhoneTypes;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column()
  phone_number: string;

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
