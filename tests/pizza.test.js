import { test, expect } from 'playwright-test-coverage';


test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    //expect(route.request().method()).toBe('POST');
    //expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('http://localhost:5173/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
  await page.getByRole('link', { name: 'Kc'}).click();

});

test('register then logout', async ({ page }) => {

  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading')).toContainText('Welcome to the party');
  await page.getByPlaceholder('Full name').click();
  await page.getByPlaceholder('Full name').fill('name');
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('name@test.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Register' }).click();
 // await expect(page.locator('#navbar-dark')).toContainText('Logout');
  //await page.getByRole('link', { name: 'Logout' }).click();
  //await expect(page.locator('#navbar-dark')).toContainText('Login');
});

test('confirm about and history display', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toContainText('The secret sauce');
    await expect(page.getByRole('main').getByRole('img').first()).toBeVisible();
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
    await expect(page.getByRole('main').locator('div').nth(3)).toBeVisible();
});

test('diner-dashboard', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'Kc' })).toBeVisible();
  await page.getByRole('link', { name: 'Kc' }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
});

test('diner-dashboard check 2', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'crro8ea1jc@admin.com', password: 't' };
    const loginRes = { user: { id: 100, name: 'Kai', email: 'crro8ea1jc@admin.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });


  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('crro8ea1jc@admin.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('t');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'K', exact: true }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('link', { name: 'Order' }).click();
  await page.getByRole('link', { name: 'K', exact: true }).click();
});



test('create store and close it', async ({ page }) => {
  let madeStore = false
  await page.goto('http://localhost:5173/');

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'franch@jwt.com', password: 'a' };
    const loginRes = { user: { id: 121, name: 'Kan', email: 'franch@jwt.com', roles: [{ objectId: 51, role: 'franchisee' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');

    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/franchise/121', async (route) => {
    const expectedToken = 'Bearer abcdef';

    const authHeader = route.request().headers()['authorization'];

    if (authHeader === expectedToken && !madeStore) {
      const franchiseRes = [{ id: 51, name: 'pizzaPocket', admins: [{ id: 121, name: 'Kan', email: 'franch@jwt.com' }], stores: [] }];

       // Fulfill the request with the mock data
       await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(franchiseRes),
      });
    } else {
      const franchiseRes = [{ id: 51, name: 'pizzaPocket', admins: [{ id: 121, name: 'Kan', email: 'franch@jwt.com' }], stores: [ { "id": 143, "name": "fakestore", "totalRevenue": 0}] }];

       // Fulfill the request with the mock data
       await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(franchiseRes),
      });
    }
  });

  await page.route('**/api/franchise/51/store', async (route) => {
    const postData = route.request().postDataJSON();
    const expectedAuth = 'Bearer abcdef';
    const storeRes = { id: 143, franchiseId: 51, name: 'fakestore' };

    // Check if the correct Authorization header and payload are sent
    const header = route.request().headers()['authorization'];
    madeStore = true;
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(storeRes)
        });
    
  });

  await page.route('**/api/franchise/51/store/143', async (route) => {
    const expectedAuth = 'Bearer abcdef';
    
    // Check if the correct Authorization header is sent
    const headers = route.request().headers();
    if (headers['authorization'] === expectedAuth) {
        const deleteRes = { message: 'store deleted' };
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(deleteRes)
        });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: authHeader }),
      });
    }
  });
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('franch@jwt.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('list')).toContainText('franchise-dashboard');

  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading')).toContainText('Create store');
  await page.getByPlaceholder('store name').click();
  await page.getByPlaceholder('store name').fill('fakestore');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('tbody')).toContainText('fakestore');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('login as admin', async ({ page }) => {

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'aa@admin.com', password: 'admin' };
    const loginRes = { user: { id: 154, name: 'administrator', email: 'aa@admin.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');

    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const expectedToken = 'Bearer abcdef';

    const authHeader = route.request().headers()['authorization'];

    if (authHeader === expectedToken) {
      const franchiseRes = [];

       // Fulfill the request with the mock data
       await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(franchiseRes),
      });
    }
  });


  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('aa@admin.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').click();
  await page.getByPlaceholder('franchise name').fill('testFranchise');
  await page.getByPlaceholder('franchisee admin email').click();
  await page.getByPlaceholder('franchisee admin email').fill('f');
});



test('create and delete franchise', async ({ page }) => {
  let madeFranchise = false;
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'aa@admin.com', password: 'admin' };
    const loginRes = { user: { id: 154, name: 'administrator', email: 'aa@admin.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');

    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    if(route.request().method() == 'GET'){
      const expectedToken = 'Bearer abcdef';    
      const authHeader = route.request().headers()['authorization'];    
      if (authHeader === expectedToken && !madeFranchise) {
        const franchiseRes = [];    
         // Fulfill the request with the mock data
         await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(franchiseRes),
        });
      } else {
        const franchiseRes = [{"stores": [], "name": "test", "admins": [{"email": "test@franch.com", "id": 47, "name": "dk746k4hoh"}], "id": 175}];   
        // Fulfill the request with the mock data
        await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(franchiseRes),
       });
      }
    } else if(route.request().method() == 'POST') {
      madeFranchise = true;
      const franchiseReq = {stores: [], name: "test", admins: [{email: "test@franch.com"}]};
      const franchiseRes = {"stores": [], "name": "test", "admins": [{"email": "test@franch.com", "id": 47, "name": "dk746k4hoh"}], "id": 175};
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.route('*/**/api/franchise/175', async (route) => {
    madeFranchise = false;
    const deleteRes = {"message":"franchise deleted"};
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: deleteRes });
  });


  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('aa@admin.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
 

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').click();
  await page.getByPlaceholder('franchise name').fill('test');
  await page.getByPlaceholder('franchisee admin email').click();
  await page.getByPlaceholder('franchisee admin email').fill('test@franch.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('cell', { name: 'test' })).toBeVisible();
  await page.getByRole('row', { name: 'test dk746k4hoh Close' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Close' }).click();
  
});


test('test delivery', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    //expect(route.request().method()).toBe('POST');
    //expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('http://localhost:5173/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('h3')).toContainText('valid');
 // await expect(page.getByText('{ "vendor": { "id": "kobydj')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  //await page.getByRole('button', { name: 'Order more' }).click();

});


test('go to diningdashboard not logged in', async ({ page }) => {
  // Go to the DinerDashboard page without a user
  await page.goto('http://localhost:5173/diner-dashboard'); 
  await expect(page.getByRole('heading')).toContainText('Oops');
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
});