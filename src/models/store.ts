import { Store as MedusaStore } from '@medusajs/medusa';
import { Entity, JoinColumn, OneToMany, Column, ManyToMany } from 'typeorm';
import { Order } from './order';
import { Product } from './product';
import { Role } from './role';
import { User } from './user';

@Entity()
export class Store extends MedusaStore {
  @ManyToMany(() => User, (user) => user.stores)
  members?: User[];

  @OneToMany(() => Product, (product) => product?.store)
  products?: Product[];

  @OneToMany(() => Order, (order) => order?.store)
  orders?: Order[];

  @OneToMany(() => Role, (role) => role.store)
  @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
  roles: Role[];

  @Column({ type: 'varchar', unique: true, nullable: true })
  domain: string;
}
