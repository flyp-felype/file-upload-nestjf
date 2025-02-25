CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    "debtId" UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    "governmentId" VARCHAR(11) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "debtAmount" DECIMAL(10, 2) NOT NULL,
    "debtDueDate" DATE NOT NULL,
    "invoiceGenerated" BOOLEAN DEFAULT FALSE NOT NULL,
    barcode varchar(255),
    "sendNotification" BOOLEAN default false not null
);

CREATE TABLE IF NOT EXISTS file_metadata (
    id serial primary key ,
    file_name varchar(255) not null,
    file_type char(30) not null,
    status varchar(100),
    total_register int,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS file_row (
    id serial primary key,
    file_metadata_id int not null references file_metadata(id) on delete cascade,
    row  text not null,
    status varchar(100),
    response text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);