const fs = require('fs');
const path = require('path');

const structure = {
  'README.md': '',
  'docker-compose.yml': '',
  'jest.config.js': '',
  'package-lock.json': '',
  'package.json': '',
  scripts: {
    'migrate.ts': '// scripts/migrate.ts',
    'seed.ts': '// scripts/seed.ts',
  },
  src: {
    config: {
      'app.config.ts': '// src/config/app.config.ts',
      'associations.config.ts': '// src/config/associations.config.ts',
      'cloudinary.config.ts': '// src/config/cloudinary.config.ts',
      'database.config.ts': '// src/config/database.config.ts',
      'shoppn-new.sql': '// src/config/shoppn-new.sql',
    },
    graphql: {
      resolvers: {
        'admin.resolver.ts': '// src/graphql/resolvers/admin.resolver.ts',
        'brand.resolver.ts': '// src/graphql/resolvers/brand.resolver.ts',
        'cart.resolver.ts': '// src/graphql/resolvers/cart.resolver.ts',
        'category.resolver.ts': '// src/graphql/resolvers/category.resolver.ts',
        'checkout.resolver.ts': '// src/graphql/resolvers/checkout.resolver.ts',
        'customer.resolver.ts': '// src/graphql/resolvers/customer.resolver.ts',
        'product.resolver.ts': '// src/graphql/resolvers/product.resolver.ts',
        'review.resolver.ts': '// src/graphql/resolvers/review.resolver.ts',
        'role.resolver.ts': '// src/graphql/resolvers/role.resolver.ts',
        'seller.resolver.ts': '// src/graphql/resolvers/seller.resolver.ts',
        'sellerReview.resolver.ts':
          '// src/graphql/resolvers/sellerReview.resolver.ts',
        'user.resolver.ts': '// src/graphql/resolvers/user.resolver.ts',
      },
      scalars: {
        'date.scalar.ts': '// src/graphql/scalars/date.scalar.ts',
      },
      types: {
        'admin.types.ts': '// src/graphql/types/admin.types.ts',
        'brand.types.ts': '// src/graphql/types/brand.types.ts',
        'cart.types.ts': '// src/graphql/types/cart.types.ts',
        'category.types.ts': '// src/graphql/types/category.types.ts',
        'checkout.types.ts': '// src/graphql/types/checkout.types.ts',
        'customer.types.ts': '// src/graphql/types/customer.types.ts',
        'product.types.ts': '// src/graphql/types/product.types.ts',
        'review.types.ts': '// src/graphql/types/review.types.ts',
        'role.types.ts': '// src/graphql/types/role.types.ts',
        'sellerReview.types.ts': '// src/graphql/types/sellerReview.types.ts',
        'seller.types.ts': '// src/graphql/types/seller.types.ts',
        'user.types.ts': '// src/graphql/types/user.types.ts',
      },
    },
    middleware: {
      'auth.middleware.ts': '// src/middleware/auth.middleware.ts',
      'cart.middleware.ts': '// src/middleware/cart.middleware.ts',
      'error.middleware.ts': '// src/middleware/error.middleware.ts',
      'rateLimiter.middleware.ts':
        '// src/middleware/rateLimiter.middleware.ts',
    },
    models: {
      'brand.model.ts': '// src/models/brand.model.ts',
      'cart.model.ts': '// src/models/cart.model.ts',
      'category.model.ts': '// src/models/category.model.ts',
      'coupon.model.ts': '// src/models/coupon.model.ts',
      'order.model.ts': '// src/models/order.model.ts',
      'orderCoupon.model.ts': '// src/models/orderCoupon.model.ts',
      'orderStatus.model.ts': '// src/models/orderStatus.model.ts',
      'payment.model.ts': '// src/models/payment.model.ts',
      'paymentMethod.model.ts': '// src/models/paymentMethod.model.ts',
      'product.model.ts': '// src/models/product.model.ts',
      'productVariation.model.ts': '// src/models/productVariation.model.ts',
      'review.model.ts': '// src/models/review.model.ts',
      'role.model.ts': '// src/models/role.model.ts',
      'seller.model.ts': '// src/models/seller.model.ts',
      'sellerAnalytics.model.ts': '// src/models/sellerAnalytics.model.ts',
      'sellerInventory.model.ts': '// src/models/sellerInventory.model.ts',
      'sellerReview.model.ts': '// src/models/sellerReview.model.ts',
      'shippingAddress.model.ts': '// src/models/shippingAddress.model.ts',
      'user.model.ts': '// src/models/user.model.ts',
    },
    modules: {
      admin: {
        'admin.controller.ts': '// src/modules/admin/admin.controller.ts',
        'admin.module.ts': '// src/modules/admin/admin.module.ts',
        'admin.service.ts': '// src/modules/admin/admin.service.ts',
      },
      brand: {
        'brand.controller.ts': '// src/modules/brand/brand.controller.ts',
        'brand.module.ts': '// src/modules/brand/brand.module.ts',
        'brand.service.ts': '// src/modules/brand/brand.service.ts',
      },
      cart: {
        'cart.controller.ts': '// src/modules/cart/cart.controller.ts',
        'cart.module.ts': '// src/modules/cart/cart.module.ts',
        'cart.service.ts': '// src/modules/cart/cart.service.ts',
      },
      category: {
        'category.controller.ts':
          '// src/modules/category/category.controller.ts',
        'category.module.ts': '// src/modules/category/category.module.ts',
        'category.service.ts': '// src/modules/category/category.service.ts',
      },
      checkout: {
        'checkout.controller.ts':
          '// src/modules/checkout/checkout.controller.ts',
        'checkout.module.ts': '// src/modules/checkout/checkout.module.ts',
        'checkout.service.ts': '// src/modules/checkout/checkout.service.ts',
      },
      customer: {
        'customer.controller.ts':
          '// src/modules/customer/customer.controller.ts',
        'customer.module.ts': '// src/modules/customer/customer.module.ts',
        'customer.service.ts': '// src/modules/customer/customer.service.ts',
      },
      payment: {
        'payment.controller.ts': '// src/modules/payment/payment.controller.ts',
        'payment.module.ts': '// src/modules/payment/payment.module.ts',
        'payment.service.ts': '// src/modules/payment/payment.service.ts',
      },
      paymentMethod: {
        'paymentMethod.controller.ts':
          '// src/modules/paymentMethod/paymentMethod.controller.ts',
        'paymentMethod.module.ts':
          '// src/modules/paymentMethod/paymentMethod.module.ts',
        'paymentMethod.service.ts':
          '// src/modules/paymentMethod/paymentMethod.service.ts',
      },
      product: {
        'product.controller.ts': '// src/modules/product/product.controller.ts',
        'product.module.ts': '// src/modules/product/product.module.ts',
        'product.service.ts': '// src/modules/product/product.service.ts',
      },
      review: {
        'review.controller.ts': '// src/modules/review/review.controller.ts',
        'review.module.ts': '// src/modules/review/review.module.ts',
        'review.service.ts': '// src/modules/review/review.service.ts',
      },
      role: {
        'role.controller.ts': '// src/modules/role/role.controller.ts',
        'role.module.ts': '// src/modules/role/role.module.ts',
        'role.service.ts': '// src/modules/role/role.service.ts',
      },
      seller: {
        'seller.controller.ts': '// src/modules/seller/seller.controller.ts',
        'seller.module.ts': '// src/modules/seller/seller.module.ts',
        'seller.service.ts': '// src/modules/seller/seller.service.ts',
      },
      sellerReview: {
        'sellerReview.controller.ts':
          '// src/modules/sellerReview/sellerReview.controller.ts',
        'sellerReview.module.ts':
          '// src/modules/sellerReview/sellerReview.module.ts',
        'sellerReview.service.ts':
          '// src/modules/sellerReview/sellerReview.service.ts',
      },
      shippingAddress: {
        'shippingAddress.controller.ts':
          '// src/modules/shippingAddress/shippingAddress.controller.ts',
        'shippingAddress.module.ts':
          '// src/modules/shippingAddress/shippingAddress.module.ts',
        'shippingAddress.service.ts':
          '// src/modules/shippingAddress/shippingAddress.service.ts',
      },
      user: {
        'user.controller.ts': '// src/modules/user/user.controller.ts',
        'user.module.ts': '// src/modules/user/user.module.ts',
        'user.service.ts': '// src/modules/user/user.service.ts',
      },
    },
    utils: {
      'helpers.ts': '// src/utils/helpers.ts',
      'logger.ts': '// src/utils/logger.ts',
    },
    'app.controller.ts': '// src/app.controller.ts',
    'app.module.ts': '// src/app.module.ts',
    'app.service.ts': '// src/app.service.ts',
    'main.ts': '// src/main.ts',
  },
  test: {
    integration: {
      api: {},
      database: {},
    },
    unit: {
      models: {},
      resolvers: {},
      services: {},
    },
  },
};

function createStructure(basePath, structure) {
  for (const name in structure) {
    const content = structure[name];
    const currentPath = path.join(basePath, name);

    if (typeof content === 'object') {
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`Created directory: ${currentPath}`);
      }
      createStructure(currentPath, content);
    } else {
      if (!fs.existsSync(currentPath)) {
        fs.writeFileSync(currentPath, content + '\n');
        console.log(`Created file: ${currentPath}`);
      }
    }
  }
}

createStructure(__dirname, structure);
