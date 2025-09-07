<template>
  <div class="content-section">
    <div class="text-content">
      <h2 class="text">免责声明</h2>
      <p class="vue">
        本项目仅限个人学习与技术交流使用,请24小时内删除,严禁用于商业用途或任何非法活动,更不得随意传播造成不良影响。本项将自动保存使用者相关信息,恶意传播需自行承担法律风险。
      </p>
      <RouterLink to="/OAuth">返回</RouterLink>
      <!-- <ul class="feature-list">
          <li v-for="item in features" :key="item">
            <i class="fas fa-check-circle"></i> {{ item }}
          </li>
        </ul> -->
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}
.content-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}
.about-image {
  flex: 1;
  min-width: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.text-content {
  flex: 1;
  max-width: 500px;
  min-width: 300px;
}
.feature-list {
  margin-top: 1rem;
  list-style: none;
}
.feature-list li {
  margin-bottom: 0.5rem;
}
@media (max-width: 768px) {
  .content-section {
    flex-direction: column;
  }
}
</style>
