import { CategoryRepository } from '../repositories/category-repository';
import { AuditService } from '../../audit/services/audit-service';

export class CategoryService {
  static async getCategories(branchId: string) {
    return CategoryRepository.findAll(branchId);
  }

  static async getCategory(id: string) {
    return CategoryRepository.findById(id);
  }

  static async createCategory(
    data: { name: string; description?: string; branchId: string },
    userId: string,
  ) {
    const category = await CategoryRepository.create(data);

    await AuditService.log({
      userId,
      action: 'CATEGORY_CREATED',
      entity: 'category',
      entityId: category.id,
      newValue: category,
      branchId: data.branchId,
      deviceId: 'local',
    });

    return category;
  }

  static async updateCategory(
    id: string,
    data: { name?: string; description?: string },
    userId: string,
  ) {
    const oldCategory = await CategoryRepository.findById(id);
    const category = await CategoryRepository.update(id, data);

    await AuditService.log({
      userId,
      action: 'CATEGORY_UPDATED',
      entity: 'category',
      entityId: id,
      oldValue: oldCategory,
      newValue: category,
      branchId: category.branchId,
      deviceId: 'local',
    });

    return category;
  }

  static async deleteCategory(id: string, userId: string) {
    const category = await CategoryRepository.softDelete(id);

    await AuditService.log({
      userId,
      action: 'CATEGORY_DELETED',
      entity: 'category',
      entityId: id,
      branchId: category.branchId,
      deviceId: 'local',
    });

    return category;
  }
}

export default CategoryService;
