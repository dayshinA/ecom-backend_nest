const fs = require('fs');
const path = require('path');

const structure = {
  src: {
    interfaces: {
      models: {
        'base.interface.ts': '// src/interfaces/models/base.interface.ts',
        'user.interface.ts': '// src/interfaces/models/user.interface.ts',
        'brand.interface.ts': '// src/interfaces/models/brand.interface.ts',
        'cart.interface.ts': '// src/interfaces/models/cart.interface.ts',
        'category.interface.ts': '// src/interfaces/models/category.interface.ts',
        'coupon.interface.ts': '// src/interfaces/models/coupon.interface.ts',
        'order.interface.ts': '// src/interfaces/models/order.interface.ts',
        'orderCoupon.interface.ts': '// src/interfaces/models/orderCoupon.interface.ts',
        'orderStatus.interface.ts': '// src/interfaces/models/orderStatus.interface.ts',
        'payment.interface.ts': '// src/interfaces/models/payment.interface.ts',
        'paymentMethod.interface.ts': '// src/interfaces/models/paymentMethod.interface.ts',
        'product.interface.ts': '// src/interfaces/models/product.interface.ts',
        'productVariation.interface.ts': '// src/interfaces/models/productVariation.interface.ts',
        'review.interface.ts': '// src/interfaces/models/review.interface.ts',
        'role.interface.ts': '// src/interfaces/models/role.interface.ts',
        'seller.interface.ts': '// src/interfaces/models/seller.interface.ts',
        'sellerAnalytics.interface.ts': '// src/interfaces/models/sellerAnalytics.interface.ts',
        'sellerInventory.interface.ts': '// src/interfaces/models/sellerInventory.interface.ts',
        'sellerReview.interface.ts': '// src/interfaces/models/sellerReview.interface.ts',
        'shippingAddress.interface.ts': '// src/interfaces/models/shippingAddress.interface.ts'
      },
      responses: {
        'base.interface.ts': '// src/interfaces/responses/base.interface.ts',
        'admin.interface.ts': '// src/interfaces/responses/admin.interface.ts',
        'auth.interface.ts': '// src/interfaces/responses/auth.interface.ts',
        'brand.interface.ts': '// src/interfaces/responses/brand.interface.ts',
        'cart.interface.ts': '// src/interfaces/responses/cart.interface.ts',
        'category.interface.ts': '// src/interfaces/responses/category.interface.ts',
        'checkout.interface.ts': '// src/interfaces/responses/checkout.interface.ts',
        'customer.interface.ts': '// src/interfaces/responses/customer.interface.ts',
        'order.interface.ts': '// src/interfaces/responses/order.interface.ts',
        'payment.interface.ts': '// src/interfaces/responses/payment.interface.ts',
        'product.interface.ts': '// src/interfaces/responses/product.interface.ts',
        'review.interface.ts': '// src/interfaces/responses/review.interface.ts',
        'seller.interface.ts': '// src/interfaces/responses/seller.interface.ts',
        'user.interface.ts': '// src/interfaces/responses/user.interface.ts'
      },
      requests: {
        'base.interface.ts': '// src/interfaces/requests/base.interface.ts',
        'admin.interface.ts': '// src/interfaces/requests/admin.interface.ts',
        'auth.interface.ts': '// src/interfaces/requests/auth.interface.ts',
        'brand.interface.ts': '// src/interfaces/requests/brand.interface.ts',
        'cart.interface.ts': '// src/interfaces/requests/cart.interface.ts',
        'category.interface.ts': '// src/interfaces/requests/category.interface.ts',
        'checkout.interface.ts': '// src/interfaces/requests/checkout.interface.ts',
        'customer.interface.ts': '// src/interfaces/requests/customer.interface.ts',
        'order.interface.ts': '// src/interfaces/requests/order.interface.ts',
        'payment.interface.ts': '// src/interfaces/requests/payment.interface.ts',
        'product.interface.ts': '// src/interfaces/requests/product.interface.ts',
        'review.interface.ts': '// src/interfaces/requests/review.interface.ts',
        'seller.interface.ts': '// src/interfaces/requests/seller.interface.ts',
        'user.interface.ts': '// src/interfaces/requests/user.interface.ts'
      }
    }
  }
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