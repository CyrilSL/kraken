import { Lifetime } from "awilix"
import { 
  FindConfig,
  StoreService as MedusaStoreService, Store, User,
} from "@medusajs/medusa"
import StoreRepository from 'src/repositories/store';
import { EntityManager } from 'typeorm';
import ProductRepository from "src/repositories/products";
import {Product} from 'src/models/product'



class StoreService extends MedusaStoreService {
  static LIFE_TIME = Lifetime.SCOPED
   protected readonly loggedInUser_: User | null
  protected storeRepository_: typeof StoreRepository;
  protected productRepository_ : typeof ProductRepository
  constructor(container, options) {
    // @ts-expect-error prefer-rest-params
    super(...arguments)
    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
      // console.log("storeService Error : ",e)
    }
  }

  async retrieve(config?: FindConfig<Store>): Promise<Store> {
    if (!this.loggedInUser_) {
      return super.retrieve(config);
    }
    return this.retrieveForLoggedInUser(config);
  }

  async retrieveForLoggedInUser(config?: FindConfig<Store>) {
    const storeRepo = this.manager_.withRepository(this.storeRepository_);
    // Ensure that the config object and its relations property are defined
    const effectiveConfig = {
        ...config,
        relations: config && config.relations ? [...config.relations, 'members'] : ['members']
    };

    const store = await storeRepo.findOne({
        ...effectiveConfig,
        where: {
            id: this.loggedInUser_.store_id
        },
    });

    if (!store) {
        throw new Error('Unable to find the user store');
    }
    return store;
}

// In StoreService.ts
  // Method to update the store's domain
  async listAllStores(): Promise<Store[]> {
    // Use the storeRepository to access all stores
    const stores = await this.storeRepository_.find();
    return stores;
  }

  async fetchProductsByStoreId(storeId: string, config?: FindConfig<Product>): Promise<Product[]> {

 const products = await this.productRepository_.find({
  where: {
    store_id: storeId,
  },
});

    return products;
  }

  // async findByDomain(domainName: string): Promise<Store | undefined> {
  //   const store = await this.storeRepository_.findOne({
  //     where: {
  //       domain: domainName,
  //     },
  //   });
    
  //   return store;
  // }


	async createForUser() {
		return await this.atomicPhase_(async (transactionManager: EntityManager) => {
			const storeRepository = transactionManager.withRepository(this.storeRepository_);
			const currencyRepository = transactionManager.withRepository(this.currencyRepository_);

			const newStore = storeRepository.create();

			const usd = await currencyRepository.findOne({
				where: {
					code: 'usd',
				},
			});

			if (usd) {
				newStore.currencies = [usd];
			}

			return await storeRepository.save(newStore);
		});
	}

}


export default StoreService