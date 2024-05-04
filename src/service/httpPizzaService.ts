import { PizzaService, Franchise, Store, OrderHistory, User, Menu, Order, Role } from './pizzaService';

class HttpPizzaService implements PizzaService {
  async callEndpoint(path: string, method: string = 'GET', body?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const options: any = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const r = await fetch('http://localhost:3000' + path, options);
        const j = await r.json();
        if (r.ok) {
          resolve(j);
        } else {
          reject({ code: r.status, message: j.message });
        }
      } catch (e) {
        reject({ code: 500, message: e.message });
      }
    });
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.callEndpoint('/api/auth', 'PUT', { email, password });
    localStorage.setItem('user', JSON.stringify(user));
    return Promise.resolve(user);
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const user = await this.callEndpoint('/api/auth', 'POST', { name, email, password });
    localStorage.setItem('user', JSON.stringify(user));
    return Promise.resolve(user);
  }

  async logout(): Promise<void> {
    return new Promise(async (resolve) => {
      localStorage.removeItem('user');
      await this.callEndpoint('/api/auth', 'DELETE');
      resolve();
    });
  }

  async getUser(): Promise<User | null> {
    return new Promise((resolve) => {
      let user: User | null = JSON.parse(localStorage.getItem('user') || 'null');

      return resolve(user);
    });
  }

  async getMenu(): Promise<Menu> {
    return this.callEndpoint('/api/order/menu');
  }

  async getOrders(user: User): Promise<OrderHistory> {
    return this.callEndpoint('/api/order');
  }

  async order(order: Order): Promise<Order> {
    return this.callEndpoint('/api/order', 'POST', order);
  }

  async getFranchise(user: User): Promise<Franchise | null> {
    return this.callEndpoint(`/api/franchise/${user.id}`);
  }

  async createFranchise(franchise: Franchise): Promise<Franchise> {
    return this.callEndpoint('/api/franchise', 'POST', franchise);
  }

  async getFranchises(): Promise<Franchise[]> {
    return this.callEndpoint('/api/franchise');
  }

  async closeFranchise(franchise: Franchise): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  async createStore(franchise: Franchise, store: Store): Promise<Store> {
    return new Promise((resolve) => {
      resolve({} as Store);
    });
  }

  async closeStore(franchise: Franchise, store: Store): Promise<null> {
    return new Promise((resolve) => {
      resolve(null);
    });
  }
}

const httpPizzaService = new HttpPizzaService();
export default httpPizzaService;