export default {
  path: '/uias/config',
  name: 'Config',
  component: () => import('@/views/config/index.vue'),
  meta: {
    title: '系统配置',
    icon: 'Setting'
  }
} 