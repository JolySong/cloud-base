export default {
  path: '/uias/user',
  name: 'User',
  component: () => import('@/views/user/index.vue'),
  meta: {
    title: '用户管理',
    icon: 'User'
  }
} 