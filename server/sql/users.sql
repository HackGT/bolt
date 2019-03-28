drop table if exists Users cascade;

create table Users
(
	uuid uuid not null,
	token char(256) not null,
	name text not null,
	email text not null,
	phone text not null,
	slackUsername text not null,
	haveID boolean default false not null,
	admin boolean default false not null
);

create unique index Users_uuid_uindex
	on Users (uuid);

alter table Users
	add constraint Users_pk
		primary key (uuid);
