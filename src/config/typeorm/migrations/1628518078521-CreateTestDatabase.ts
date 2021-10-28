import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTestDatabase1628518078521 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.createDatabase('auth_api_test', true);
    await queryRunner.startTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.dropDatabase('auth_api_test');
    await queryRunner.startTransaction();
  }
}
