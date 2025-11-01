"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRolesColumnToUser1757691788565 = void 0;
class AddRolesColumnToUser1757691788565 {
    name = 'AddRolesColumnToUser1757691788565';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    }
}
exports.AddRolesColumnToUser1757691788565 = AddRolesColumnToUser1757691788565;
//# sourceMappingURL=1757691788565-AddRolesColumnToUser.js.map