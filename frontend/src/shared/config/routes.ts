export const ROUTES = {
  home: '/',
  tasteMap: '/taste-map',
  reviews: (id?: number) => (id != null ? `/drinks?id=${id}` : '/drinks'),
  profile: '/profile',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  admin: {
    drinks: '/admin/drinks',
    newDrink: '/admin/drinks/new',
    editDrink: (id: number) => `/admin/drinks/${id}/edit`,
  },
} as const
