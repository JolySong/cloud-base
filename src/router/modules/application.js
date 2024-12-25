export default {
  path: '/uias/application',
  name: 'Application',
  component: () => import('@/views/application/index.vue'),
  meta: {
    title: '应用管理',
    icon: 'Operation'
  }
} 