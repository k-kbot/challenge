export class HumanName {
  private readonly MAX_LENGTH = 20

  constructor(private readonly _value: string) {
    if (_value.length >= this.MAX_LENGTH) {
      throw new Error(`名前は${this.MAX_LENGTH}文字未満でなければなりません`)
    }
    this._value = _value
  }
}
