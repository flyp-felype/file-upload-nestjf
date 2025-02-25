import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileFileRowTable1740440875919 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table file_row (
    id serial primary key,
    file_metadata_id int not null references file_metadata(id) on delete cascade,
    row  text not null,
    status varchar(100),
    response text,
    created_at timestamp default now(),
    updated_at timestamp default now()

);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS file_row`);
  }
}
