'use strict';

export interface ISessionRequest {
  userEmail: string,
}

export interface ISessionData {
  userEmail: string,
  readonly createdAt: number,
}

export interface IUserAccountConfig {
  domain: { [key: string]: string },
  accountRegistration: {
    tokenDurationInSeconds: number,
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
    },
    activationRelUrl: string,
  },
  accountActivation: {
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
    },
    loginRelUrl: string,
  },
  login: {
    sessionDurationInSeconds: number,
    cookieName: string,
  },
  lostPassword: {
    tokenDurationInSeconds: number,
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
    },
    pwResetRelUrl: string,
  },
  resetPassword: {
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
    },
  },
}

export interface IUsersPendingActivation {
  token: string,
  pwHash: string,
  name: string,
}

export interface IPasswordsPendingReset {
  token: string,
}

export interface IUserEntity {
  id?: string,
  email: string,
  name: string,
  password: string,
  updatedAt: number,
  readonly createdAt: number,
}

export interface IUserEntityModifiable {
  email?: string,
  name?: string,
  password?: string,
}

export interface IUserEntityUpdate extends IUserEntityModifiable {
  updatedAt: number,
}