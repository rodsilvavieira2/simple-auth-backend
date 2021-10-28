import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { User } from '.';

@Entity('user_tokens')
export class UserTokens {
  @PrimaryColumn()
  id: string;

  @Column()
  id_user: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column()
  token: string;

  @Column()
  expires_in: Date;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}
