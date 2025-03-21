// seed.utils.ts
import config from '@/config/config';
import { ApiError } from '@/modules/errors';
import { PermissionAction } from '@/modules/permission/permission.interface';
import { permissionService } from '@/modules/permission/permission.service';
import { resourceService } from '@/modules/resource/resource.service';
import { rolePermissionService } from '@/modules/role-permission/role-permission.service';
import { roleService } from '@/modules/role/role.service';
import { userService } from '@/modules/user/user.service';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

const SUPER_ADMIN_EMAIL = 'superadmin@example.com';
const SUPER_ADMIN_PASSWORD = 'superadminpassword1';

export const seedSuperAdmin = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create Super Admin Role
    let superAdminRole = await roleService.queryByName('Super Admin', session);

    if (!superAdminRole) {
      superAdminRole = await roleService.create(
        {
          name: 'Super Admin',
          description: 'Has full access to all system resources',
        },
        session,
      );
    }

    // 2. Create Permissions for all resources
    const resources = resourceService.getResources();
    const allActions = Object.values(PermissionAction);

    for (const resource of resources) {
      // Create permission
      const permission = await permissionService.create(
        {
          resource: resource.name,
          action: allActions,
        },
        session,
      );

      console.log({ superAdminRole, permission });

      // Assign permission to role
      await rolePermissionService.create(
        {
          role: superAdminRole._id as string,
          permission: permission._id as string,
        },
        session,
      );
    }

    // 3. Create Super Admin User
    await userService.create(
      {
        name: 'Super Admin',
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        role: superAdminRole._id as string,
        isEmailVerified: true,
        status: 'Active',
        employee: null,
      },
      session,
    );

    await session.commitTransaction();
    console.log('✅ Super admin seeded successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Super admin seeding failed:', error);

    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Seeding failed');
  } finally {
    session.endSession();
  }
};

export const runSeedIfNeeded = async () => {
  if (config.env === 'production') return;

  // Check if already connected
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(config.mongoose.url, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    const existingSuperAdmin = await userService.getByEmail(SUPER_ADMIN_EMAIL);

    if (existingSuperAdmin) {
      console.log('ℹ️  Super admin already exists, skipping seeding');
      return;
    }

    console.log('⚙️  Super admin does not exist, starting database seeding...');
    await seedSuperAdmin();
  } catch (error) {
    console.error('❌ Error checking Super Admin existence:', error);
    throw error;
  }
};
