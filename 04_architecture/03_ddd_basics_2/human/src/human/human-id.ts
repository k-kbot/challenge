export class HumanId {
  constructor(private readonly _value: string) {
    if(!/^[a-zA-Z0-9]+$/.test(_value)) {
      console.log(_value)
      throw new Error('IDは英数字のみ使用できます')
    }
    this._value = _value
  }
}
