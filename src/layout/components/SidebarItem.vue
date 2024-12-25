<template>
  <div v-if="!item.hidden">
    <!-- 第一级菜单 -->
    <template v-if="isFirstLevel">
      <el-menu-item v-if="!hasChildren(item) && !item.hidden" :index="resolvePath(item.path)">
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>

      <template v-else>
        <!-- 第一级直接显示子菜单项 -->
        <template v-for="child in item.children" :key="child.path">
          <!-- 如果子项还有子菜单，则使用 el-sub-menu -->
          <el-sub-menu v-if="hasChildren(child) && !child.hidden" :index="resolvePath(child.path)">
            <template #title>
              <el-icon v-if="child.meta && child.meta.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <span>{{ child.meta?.title }}</span>
            </template>
            
            <sidebar-item
              v-for="subChild in child.children"
              :key="subChild.path"
              :item="subChild"
              :base-path="resolvePath(child.path)"
              :is-first-level="false"
            />
          </el-sub-menu>

          <!-- 如果子项没有子菜单，则使用 el-menu-item -->
          <el-menu-item v-else :index="resolvePath(child.path)">
            <el-icon v-if="child.meta && child.meta.icon">
              <component :is="child.meta.icon" />
            </el-icon>
            <template #title>{{ child.meta?.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </template>

    <!-- 非第一级菜单 -->
    <template v-else>
      <el-menu-item v-if="!hasChildren(item) && !item.hidden" :index="resolvePath(item.path)">
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>

      <el-sub-menu v-else :index="resolvePath(item.path)">
        <template #title>
          <el-icon v-if="item.meta && item.meta.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{ item.meta?.title }}</span>
        </template>
        
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :base-path="resolvePath(item.path)"
          :is-first-level="false"
        />
      </el-sub-menu>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  },
  isFirstLevel: {
    type: Boolean,
    default: true
  }
})

const hasChildren = (route) => {
  return route.children && route.children.length > 0
}

const resolvePath = (routePath) => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  if (props.isFirstLevel) {
    return `/${routePath}`
  }
  return props.basePath ? `${props.basePath}/${routePath}` : routePath
}
</script> 