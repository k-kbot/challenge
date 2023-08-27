import { Human1 } from './human/human1'
import { Human2 } from './human/human2'
import { HumanId } from './human/human-id'
import { HumanBloodType } from './human/human-blood-type'
import { HumanBirthDate } from './human/human-birth-date'
import { HumanName } from './human/human-name'

const human1 = new Human1('abc123', 'ab', new Date(2000, 1, 1), 'taro')

console.log(human1)

const id = new HumanId('abc123')
const bloodType = new HumanBloodType('ab')
const birthDate = new HumanBirthDate(new Date(2000, 1, 1))
const name = new HumanName('taro')

const human2 = Human2.create({
  id: id,
  bloodType: bloodType,
  birthDate: birthDate,
  name: name,
})

console.log(human2)
