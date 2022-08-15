export function defineVariables<T>() {
  return <C extends T>(value: C) => value;
}

export type ExtractFunctionFromPolymorphic</* Polymorphic-Type */ PT> = PT extends {
  (...args: infer A): infer R;
}
  ? (...args: A) => R
  : never;
