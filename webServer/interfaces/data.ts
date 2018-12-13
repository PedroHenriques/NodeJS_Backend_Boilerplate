'use strict';

export interface ISessionRequest {
  userID: string,
}

export interface ISessionData {
  userID: string,
  readonly createdAt: Date,
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

export interface IUserEntityResponse {
  readonly id: string,
  readonly email: string,
  readonly name: string,
  readonly updatedAt: Date,
  readonly createdAt: Date,
}