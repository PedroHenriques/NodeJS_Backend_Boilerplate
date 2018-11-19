'use strict';

const baseKeys = {
  userAccountConfig: 'userAccountConfig',
  usersPendingActivation: 'usersPendingActivation',
  sessionTokens: 'sessionTokens',
  passwordsPendingReset: 'passwordsPendingReset',
  userEntity: 'userEntity',
};

export function userAccountConfigKeyGen(): string {
  return(baseKeys.userAccountConfig);
}

export function usersPendingActivationKeyGen(args: { email: string }): string {
  return(`${baseKeys.usersPendingActivation}:${args.email}`);
}

export function sessionTokensKeyGen(args: { token: string }): string {
  return(`${baseKeys.sessionTokens}:${args.token}`);
}

export function passwordsPendingResetKeyGen(args: { email: string }): string {
  return(`${baseKeys.passwordsPendingReset}:${args.email}`);
}

export function userEntityKeyGen(args: { email: string }): string {
  return(`${baseKeys.userEntity}:${args.email}`);
}