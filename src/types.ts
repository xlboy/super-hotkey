import type { EnhancedKeyName, NativeKeyName } from './constants/key-name';

export function defineVariables<T>() {
  return <C extends T>(value: C) => value;
}

export type KeyName = EnhancedKeyName | NativeKeyName;
