import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router'
import HomePage from '@/pages/index.vue'

type RouteParams = {
  id: string;
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/c/:id',
    name: 'chat',
    component: HomePage,
    props: (route: RouteLocationNormalized & { params: RouteParams }) => ({ questionId: route.params.id }),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!sessionStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      sessionStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
      sessionStorage.removeItem('vuetify:dynamic-reload')
    }
  } else {
    console.error('Router Error:', err)
  }
})

router.isReady().then(() => {
  sessionStorage.removeItem('vuetify:dynamic-reload')
})

export default router
