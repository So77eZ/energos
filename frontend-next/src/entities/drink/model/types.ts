export interface Drink {
  id: number
  name: string
  price: number | null
  image_url: string | null
  no_sugar: boolean
  created_at: string | null
  updated_at: string | null
}

export type DrinkCreate = Pick<Drink, 'name' | 'price' | 'image_url' | 'no_sugar'>
export type DrinkUpdate = Partial<DrinkCreate>
