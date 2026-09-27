export interface Drink {
  id: number
  name: string
  price: number | null
  image_url: string | null
  no_sugar: boolean
  created_at: string | null
  updated_at: string | null
}

// Картинка меняется только через uploadImage, в теле POST/PUT её нет (#104, #114).
export type DrinkCreate = Pick<Drink, 'name' | 'price' | 'no_sugar'>
export type DrinkUpdate = DrinkCreate
