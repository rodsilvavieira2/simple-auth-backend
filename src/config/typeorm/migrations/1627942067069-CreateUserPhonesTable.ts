import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserPhonesTable1627942067069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_phones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
          },
          {
            name: 'id_user',
            type: 'uuid',
          },
          {
            name: 'id_user_phone_types',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'fk_user_phones',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['id_user'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: 'fk_phones_types',
            referencedTableName: 'user_phones_types',
            referencedColumnNames: ['id'],
            columnNames: ['id_user_phone_types'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropDatabase('user_phones');
  }
}
