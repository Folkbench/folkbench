export type StringLeaves<T> = T extends string
  ? string
  : {
      [Key in keyof T]: StringLeaves<T[Key]>
    }
