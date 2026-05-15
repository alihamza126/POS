import {
  ProductRepository,
  ProductFilter,
} from '../repositories/product-repository';
import { AuditService } from '../../audit/services/audit-service';
import { CategoryRepository } from '../../categories/repositories/category-repository';

export class ProductService {
  static async getProducts(filters: ProductFilter) {
    return ProductRepository.findAll(filters);
  }

  static async getProduct(id: string) {
    return ProductRepository.findById(id);
  }

  static async createProduct(data: any, userId: string) {
    const { initialStock, ...productData } = data;
    const product = await ProductRepository.create(productData);

    // Create initial stock movement if provided
    if (initialStock && initialStock > 0) {
      await ProductRepository.addStockMovement({
        productId: product.id,
        type: 'purchase',
        quantity: initialStock,
        userId,
        branchId: data.branchId,
        reason: 'Initial stock',
      });
    }

    await AuditService.log({
      userId,
      action: 'PRODUCT_CREATED',
      entity: 'product',
      entityId: product.id,
      newValue: { ...product, initialStock },
      branchId: data.branchId,
      deviceId: 'local',
    });

    return product;
  }

  static async updateProduct(id: string, data: any, userId: string) {
    const oldProduct = await ProductRepository.findById(id);
    const product = await ProductRepository.update(id, data);

    await AuditService.log({
      userId,
      action: 'PRODUCT_UPDATED',
      entity: 'product',
      entityId: id,
      oldValue: oldProduct,
      newValue: product,
      branchId: product.branchId,
      deviceId: 'local',
    });

    return product;
  }

  static async deleteProduct(id: string, userId: string) {
    const product = await ProductRepository.softDelete(id);

    await AuditService.log({
      userId,
      action: 'PRODUCT_DELETED',
      entity: 'product',
      entityId: id,
      branchId: product.branchId,
      deviceId: 'local',
    });

    return product;
  }

  static async adjustStock(
    productId: string,
    quantity: number,
    type: 'purchase' | 'adjustment' | 'damage',
    reason: string,
    userId: string,
    branchId: string,
  ) {
    const movement = await ProductRepository.addStockMovement({
      productId,
      type,
      quantity,
      userId,
      branchId,
      reason,
    });

    await AuditService.log({
      userId,
      action: 'STOCK_ADJUSTMENT',
      entity: 'stock_movement',
      entityId: movement.id,
      newValue: movement,
      branchId,
      deviceId: 'local',
      metadata: { productId, reason, type },
    });

    return movement;
  }

  static async importProductsBulk(products: any[], userId: string, branchId: string) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const data of products) {
      try {
        let categoryId = data.categoryId;

        // If category name is provided instead of ID, try to find/create it
        if (!categoryId && data.categoryName) {
          let category = await CategoryRepository.findByName(data.categoryName, branchId);
          if (!category) {
            category = await CategoryRepository.create({
              name: data.categoryName,
              branchId,
            });
          }
          categoryId = category.id;
        }

        const productData = {
          name: data.name,
          sku: data.sku,
          barcode: data.barcode,
          description: data.description,
          categoryId: categoryId,
          unit: data.unit || 'pcs',
          purchasePrice: parseFloat(data.purchasePrice) || 0,
          sellingPrice: parseFloat(data.sellingPrice) || 0,
          reorderLevel: parseInt(data.reorderLevel) || 10,
          branchId,
        };

        const product = await ProductRepository.create(productData);

        // Initial stock movement
        const initialStock = parseInt(data.initialStock) || 0;
        if (initialStock > 0) {
          await ProductRepository.addStockMovement({
            productId: product.id,
            type: 'purchase',
            quantity: initialStock,
            userId,
            branchId,
            reason: 'Imported initial stock',
          });
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error importing ${data.name || 'unknown product'}: ${error.message}`);
      }
    }

    await AuditService.log({
      userId,
      action: 'PRODUCTS_IMPORTED',
      entity: 'product',
      entityId: 'multiple',
      newValue: { count: results.success },
      branchId,
      deviceId: 'local',
      metadata: { total: products.length, ...results },
    });

    return results;
  }
}

export default ProductService;
