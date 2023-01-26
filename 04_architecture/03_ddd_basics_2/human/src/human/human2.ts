import { HumanId } from './human-id'
import { HumanBloodType } from './human-blood-type'
import { HumanBirthDate } from './human-birth-date'
import { HumanName } from './human-name'

interface HumanProps {
  id: HumanId
  bloodType: HumanBloodType
  birthDate: HumanBirthDate
  name: HumanName
}

export class Human2 {
  private constructor(private props: HumanProps) {}

  static create(props: HumanProps) {
    return new Human2({
      id: props.id,
      bloodType: props.bloodType,
      birthDate: props.birthDate,
      name: props.name,
    })
  }
}
