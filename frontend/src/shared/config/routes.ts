export const ROUTES = {
  home: '/',
  tasteMap: '/taste-map',
  reviews: (id?: number) => (id != null ? `/drinks?id=${id}` : '/drinks'),
  compare: (ids?: number[]) => {
    if (!ids?.length) return '/compare'
    const slots = ['a', 'b', 'c'] as const
    const params = ids.slice(0, slots.length).map((id, i) => `${slots[i]}=${id}`).join('&')
    return `/compare?${params}`
  },
  tier: '/tier',
  glossary: '/glossary',
  submit: '/submit',
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
