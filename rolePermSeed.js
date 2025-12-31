import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "./src/models/RoleModel.js";
import Permission from "./src/models/PermissionModel.js";
import User from "./src/models/UserModel.js";
import UserRole from "./src/models/UserRoleModel.js";
import RolePermission from "./src/models/RolePermissionModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/asset_mgmt";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        await Promise.all([
            Role.deleteMany({}),
            Permission.deleteMany({}),
            RolePermission.deleteMany({}),
            UserRole.deleteMany({}), 
        ]);

        const roles = [
            { name: "admin", description: "Has full access to all modules" },
            { name: "categoryAdmin", description: "Manages categories and sub-categories" },
            { name: "subCategoryAdmin", description: "Manages sub-categories and groups" },
            { name: "groupAdmin", description: "Manages groups and items" },
            { name: "itemUser", description: "Can view assigned items" },
        ];

        const permissions = [
            { action: "category:create", description: "Create categories" },
            { action: "category:view", description: "View categories" },
            { action: "category:update", description: "Update categories" },
            { action: "category:delete", description: "Delete categories" },

            { action: "subCategory:create", description: "Create sub-categories" },
            { action: "subCategory:view", description: "View sub-categories" },
            { action: "subCategory:update", description: "Update sub-categories" },
            { action: "subCategory:delete", description: "Delete sub-categories" },

            
            { action: "group:create", description: "Create groups" },
            { action: "group:view", description: "View groups" },
            { action: "group:update", description: "Update groups" },
            { action: "group:delete", description: "Delete groups" },

            { action: "item:create", description: "Create items" },
            { action: "item:view", description: "View items" },
            { action: "item:update", description: "Update items" },
            { action: "item:delete", description: "Delete items" },
        ];

        const roleDocs = {};
        for (const role of roles) {
            const doc = await Role.create(role);
            roleDocs[role.name] = doc;
        }

        const permissionDocs = {};
        for (const perm of permissions) {
            const doc = await Permission.create(perm);
            permissionDocs[perm.action] = doc;
        }

        const rolePermissionsMap = {
            admin: Object.keys(permissionDocs), 

            categoryAdmin: [
                "category:view", "category:update",
                "subCategory:create", "subCategory:view", "subCategory:update", "subCategory:delete",
                "group:create", "group:view", "group:update", "group:delete",
            ],

            subCategoryAdmin: [
                "subCategory:view", "subCategory:update",
                "group:create", "group:view", "group:update", "group:delete",
                "item:create", "item:view", "item:update", "item:delete"
            ],

            groupAdmin: [
                "group:view", "group:update",
                "item:create", "item:view", "item:update", "item:delete"
            ],

            itemUser: ["item:view", "item:update", "item:create"],
        };

        for (const [roleName, actions] of Object.entries(rolePermissionsMap)) {
            const role = roleDocs[roleName];
            for (const action of actions) {
                const permission = permissionDocs[action];
                if (!permission) continue;

                await RolePermission.create({
                    role: role._id,
                    permission: permission._id,
                });
            }
        }


        const adminRole = roleDocs["admin"];
        const adminSocialIds = ["I10201"];

        const adminUsers = await User.find({ socialId: { $in: adminSocialIds } });

        if (adminUsers.length === 0) {
            console.warn(" No users found with socialId I10201 or I10205.");
        } else {
            for (const user of adminUsers) {
                await UserRole.findOneAndUpdate(
                    { user: user._id, role: adminRole._id },
                    { user: user._id, role: adminRole._id },
                    { upsert: true, new: true }
                );
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seed();
