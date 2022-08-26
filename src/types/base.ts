export function defineVariables<T>() {
  return <C extends T>(value: C) => value;
}

export type ExtractFunctionFromPolymorphicType</* Polymorphic-Type */ PT> = PT extends {
  (...args: infer A): infer R;
}
  ? (...args: A) => R
  : never;

export type TargetElementToObserve = HTMLElement | Document;
