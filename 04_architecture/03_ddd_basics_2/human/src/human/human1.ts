export class Human1 {
  constructor(
    private readonly _id: string,
    private readonly _bloodType: string,
    private readonly _birthDate: Date,
    private readonly _name: string,
  ) {
    this._id = _id
    this._bloodType = _bloodType
    this._birthDate = _birthDate
    this._name = _name
  }
}
