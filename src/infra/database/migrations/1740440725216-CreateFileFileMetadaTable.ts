import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileFileMetadaTable1740440725216
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table file_metadata (
id serial primary key ,
file_name varchar(255) not null,
file_type char(30) not null,
status varchar(100),
total_register int,
created_at timestamp default now(),
updated_at timestamp default now()
)
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS file_metadata`);
  }
}
