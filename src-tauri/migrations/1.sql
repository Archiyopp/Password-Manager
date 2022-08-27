-- create table users with id, email , password, first_name, last_name
create table users (
    username varchar(255) not null unique,
    email varchar(255) not null,
    password varchar(255) not null,
    first_name varchar(255) not null,
    last_name varchar(255) not null
);
-- create table credentials with id, user_id, password, username, url, name
create table credentials (
    id integer not null primary key AUTOINCREMENT,
    name varchar(255) not null,
    url varchar(255) not null,
    user_username varchar(255) not null,
    username varchar(255) not null,
    password varchar(255) not null,
    foreign key (user_username) references users(username)
);