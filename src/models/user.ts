import { User as MedusaUser } from '@medusajs/medusa';
import { Column, Entity, Index, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role';
import { Store } from './store';

@Entity()
export class User extends MedusaUser {
  @Index()
  @Column({ nullable: true })
  role_id: string | null;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  teamRole: Role | null;

  @ManyToMany(() => Store, (store) => store.members)
  @JoinTable({
    name: 'user_stores', // Name of the join table
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'store_id',
      referencedColumnName: 'id'
    }
  })
  stores?: Store[];
}