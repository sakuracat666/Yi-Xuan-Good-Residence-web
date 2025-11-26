<template>
  <div class="layout-sidebar-container" :class="{ 'is-collapse': collapse }">
    <Logo />

    <el-scrollbar>
      <el-menu
        class="custom-menu"
        :defaultActive="activeMenu"
        :collapse="collapse"
        :unique-opened="false"
        router
      >
        <el-menu-item index="/index">
          <el-icon>
            <HomeFilled />
          </el-icon>
          <template #title>
            <span>首页</span>
          </template>
        </el-menu-item>
        <el-sub-menu index="1" v-if="isAdmin">
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon>
              <UserFilled />
            </el-icon>
            <template #title>
              <span>用户管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/system/post">
            <el-icon>
              <Postcard />
            </el-icon>
            <template #title>
              <span>岗位管理</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <span>公寓管理</span>
          </template>
          <el-menu-item
            index="/apartmentManagement/apartmentManagement/apartmentManagement"
          >
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <template #title>
              <span>公寓管理</span>
            </template>
          </el-menu-item>
          <el-menu-item
            index="/apartmentManagement/roomManagement/roomManagement"
          >
            <el-icon>
              <House />
            </el-icon>
            <template #title>
              <span>房间管理</span>
            </template>
          </el-menu-item>
          <el-menu-item
            index="/apartmentManagement/attributeManagement/attributeManagement"
          >
            <el-icon>
              <List />
            </el-icon>
            <template #title>
              <span>属性管理</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon>
              <Management />
            </el-icon>
            <span>租赁管理</span>
          </template>
          <el-menu-item index="/rentManagement/appointment/appointment">
            <el-icon>
              <Clock />
            </el-icon>
            <template #title>
              <span>看房预约管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/agreementManagement/agreement/agreement">
            <el-icon>
              <Document />
            </el-icon>
            <template #title>
              <span>租约管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/repairManagement/repairManagement">
            <el-icon>
              <Tools />
            </el-icon>
            <template #title>
              <span>报修管理</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <el-icon>
              <Collection />
            </el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/finance/payment/order">
            <el-icon>
              <Collection />
            </el-icon>
            <template #title>
              <span>支付订单管理</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/userManagement/userManagement" v-if="isAdmin">
          <el-icon>
            <User />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/tenantProfile/list">
          <el-icon>
            <Avatar />
          </el-icon>
          <span>租户画像监控</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import Logo from '../Logo/index.vue'
import {
  HomeFilled,
  Setting,
  UserFilled,
  Postcard,
  OfficeBuilding,
  House,
  List,
  Management,
  Clock,
  Document,
  User,
  Avatar,
  Tools,
  Collection,
} from '@element-plus/icons-vue'

export default defineComponent({
  components: {
    Logo,
    HomeFilled,
    Setting,
    UserFilled,
    Postcard,
    OfficeBuilding,
    House,
    List,
    Management,
    Clock,
    Document,
    User,
    Avatar,
    Tools,
  },
  setup() {
    const settingsStore = useSettingsStore()
    const userStore = useUserStore()
    const route = useRoute()
    const collapse = computed(() => settingsStore.collapse)
    const themeConfig = computed(() => settingsStore.themeConfig)
    const activeMenu = computed(() =>
      route.meta.activeMenu ? (route.meta.activeMenu as string) : route.path,
    )
    const isAdmin = computed(() => userStore.isAdmin)
    return {
      collapse,
      activeMenu,
      themeConfig,
      isAdmin,
    }
  },
})
</script>

<style scoped lang="scss">
.custom-menu {
  background-color: $base-menu-background;
  text-color: $base-menu-color;
  active-text-color: $base-menu-color-active;
}
@mixin active {
  &:hover {
    color: $base-color-default;
    background-color: #ecf5ff; // 浅蓝色背景
  }

  &.is-active {
    color: $base-color-white;
    background-color: var(--el-color-primary) !important;
  }
}

.layout-sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: $base-z-index;
  width: $base-left-menu-width;
  height: 100vh;
  background: #ffffff; // 白色背景
  box-shadow: 2px 0 6px rgb(0 21 41 / 35%);
  transition: width $base-transition-time;

  &.is-collapse {
    width: $base-left-menu-width-min;
    border-right: 0;
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;

    .el-menu {
      border: 0;
      background-color: #ffffff; // 白色背景
    }

    .el-menu-item,
    .el-submenu__title {
      height: $base-menu-item-height;
      overflow: hidden;
      line-height: $base-menu-item-height;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
      color: #333; // 深色文字，确保在白色背景上有良好的可读性
    }

    .el-menu-item {
      @include active;
    }
  }
}
</style>
