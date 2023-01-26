export class HumanBirthDate {
  constructor(private readonly _value: Date) {
    if (_value >= this.twentyYearsAgo()) {
      throw new Error(`20際以上のみ設定可能です`)
    }
    this._value = _value
  }

  private twentyYearsAgo(): Date {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 20)
    return date
  }
}
