import { UserService as MedusaUserService } from '@medusajs/medusa';
import {
  FilterableUserProps,
  CreateUserInput as MedusaCreateUserInput,
  UpdateUserInput,
} from '@medusajs/medusa/dist/types/user';
import { Lifetime } from 'awilix';
import { User } from '../models/user';
import StoreRepository from '../repositories/store';
import { Store } from 'src/models/store';
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
      // console.log(e)
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
    console.log('AAAAAAAAAAAAAAAAAAA');

    
    if (!selector.store_id && this.loggedInUser_?.store_id) {
      selector.store_id = this.loggedInUser_.store_id;
    }

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

  async createStoreForUser(userId: string, storeDetails: Partial<Store> = {}): Promise<Store> {
    const storeRepo = this.manager_.withRepository(this.storeRepository_);
    const userRepo = this.manager_.getRepository(User);

    // Include a name in the storeDetails if not provided
    storeDetails.name = storeDetails.name || "My New Store";

    let newStore = storeRepo.create(storeDetails);
    newStore = await storeRepo.save(newStore);

    const user = await userRepo.findOne({ where: { id: userId }, relations: ['stores'] });
    if (!user) {
      throw new Error('User not found');
    }

    user.stores = user.stores || [];
    user.stores.push(newStore);
    await userRepo.save(user);

    return newStore;
  }

  async fetchUsersStores(userId: string): Promise<Store[]> {
    console.log("In Fetch Service")
    const userRepo = this.manager_.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ['stores']  // Ensure to load the stores relation
    });

    if (!user) {
      throw new Error('User not found');
    }
    console.log("User stores : ",user.stores)
    return user.stores || [];
  }

}
export default UserService;
