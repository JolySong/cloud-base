import { createRouter, createWebHistory } from 'vue-router'
import applicationRoutes from './modules/application'
import resourceRoutes from './modules/resource'
import roleRoutes from './modules/role'
import userRoutes from './modules/user'
import configRoutes from './modules/config'

// 基础路由
export const constantRoutes = [
  {
    path: '/',
    redirect: '/uias/dashboard',
    hidden: true
  },
  {
    path: '/uias',
    component: () => import('@/layout/index.vue'),
    redirect: '/uias/dashboard',
    children: [
      {
        path: '/uias/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'Odometer' }
      },
      applicationRoutes,
      resourceRoutes,
      roleRoutes,
      userRoutes,
      configRoutes
    ]
  },
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录' },
    hidden: true,
    component: () => import('@/views/auth/index.vue')
  },
  // 404 页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' },
    hidden: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 统一身份认证` : '统一身份认证系统'
  next()
})

export default router 