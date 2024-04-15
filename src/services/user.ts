import { UserService as MedusaUserService } from '@medusajs/medusa';
import {
  FilterableUserProps,
  CreateUserInput as MedusaCreateUserInput,
  UpdateUserInput,
} from '@medusajs/medusa/dist/types/user';
import { Lifetime } from 'awilix';
import { User } from '../models/user';
import StoreRepository from '../repositories/store';

type CreateUserInput = {
  store_id?: string;
} & MedusaCreateUserInput;

// type UserSelector = FilterableUserProps &
// Selector<User> & { store_id?: string };

class UserService extends MedusaUserService {
  static LIFE_TIME = Lifetime.SCOPED;
  protected readonly loggedInUser_: User | null;
  protected readonly storeRepository_: typeof StoreRepository;

  constructor(container, options) {
    // @ts-expect-error prefer-rest-params
    super(...arguments);
    this.storeRepository_ = container.storeRepository;

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  async create(user: CreateUserInput, password: string): Promise<User> {
    if (!user.store_id) {
      const storeRepo = this.manager_.withRepository(this.storeRepository_);
      let newStore = storeRepo.create();
      newStore = await storeRepo.save(newStore);
      user.store_id = newStore.id;
    }

    // TODO allow specifying the role on creation

    return await super.create(user, password);
  }

  async list(selector: FilterableUserProps & { store_id?: string }, config?: {}): Promise<User[]> {
    if (!selector.store_id && this.loggedInUser_?.store_id) {
      selector.store_id = this.loggedInUser_.store_id;
    }

    console.log('\nAAAAAAAAAAAAAAAAAAA', this.loggedInUser_?.store_id, '\n');

    // config.select?.push('store_id');
    // config.relations?.push('store');

    return await super.list(selector, config);
  }

  async update(
    userId: string,
    update: UpdateUserInput & {
      role_id?: string;
    }
  ): Promise<User> {
    return super.update(userId, update);
  }
}

export default UserService;
