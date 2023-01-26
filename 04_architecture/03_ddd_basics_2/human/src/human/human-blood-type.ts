type bloodType = 'a' | 'b' | 'o' | 'ab'

export class HumanBloodType {
  constructor(private readonly _value: bloodType) {
    this._value = _value
  }
}
