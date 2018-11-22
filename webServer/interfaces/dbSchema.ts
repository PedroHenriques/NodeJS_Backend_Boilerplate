'use strict';

export interface IUserEntity {
  id?: string,
  email: string,
  name: string,
  password: string,
  updatedAt: Date,
  readonly createdAt: Date,
}

export interface IUserEntityModifiable {
  email?: string,
  name?: string,
  password?: string,
}

export interface IUserEntityUpdate extends IUserEntityModifiable {
  updatedAt: Date,
}