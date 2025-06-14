<template>
  <div class="login-container">
    <!--引入粒子特效-->
    <vue-particles
      id="tsparticles"
      @particles-loaded="particlesLoaded"
      :options="options"
    />
    <a-form
      ref="formRef"
      :model="loginForm"
      class="login-form"
      :rules="loginRules"
    >
      <h3 class="title">alex管理后台</h3>
      <a-form-item name="username">
        <a-input
          v-model:value="loginForm.username"
          placeholder="请输入账号或手机号"
          autocomplete="on"
        />
      </a-form-item>
      <a-form-item name="password">
        <a-input-password
          v-model:value="loginForm.password"
          type="password"
          placeholder="请输入密码"
          autocomplete="on"
        />
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          @click="onSubmit"
          style="width: 100%"
          :loading="loading"
          >登录</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { LoginParams } from '@/api/user/login';
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user/user';
import { UnwrapRef } from 'vue';

interface loginForm {
  username: string;
  password: string;
}
const formRef = ref();
const router = useRouter();
const userStore = useUserStore();
const loginForm: UnwrapRef<loginForm> = reactive({
  username: '',
  password: '',
});

const loginRules: any = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码最少五位', trigger: 'blur' },
  ],
};

const loading = ref<boolean>(false);

const onSubmit = () => {
  loading.value = true;
  formRef.value
    .validate()
    .then(async () => {
      let param: LoginParams = {
        username: loginForm.username,
        password: loginForm.password,
      };
      const res = await userStore.login(param);
      if (res) {
        router.push('/');
      }
    })
    .catch((error: ValidateErrorEntity<loginForm>) => {
      console.log('error', error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const particlesLoaded = async (container: any) => {
  console.log('Particles container loaded', container);
};

const options = {
  background: {
    color: {
      value: '#000', //粒子颜色
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push', //可用的click模式有: "push", "remove", "repulse", "bubble"。
      },
      onHover: {
        enable: true,
        mode: 'grab', //可用的hover模式有: "grab", "repulse", "bubble"。
      },
      resize: true,
    },
    modes: {
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.8,
        size: 40,
      },
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#ffffff',
    },
    links: {
      color: '#ffffff', //'#dedede'。线条颜色。
      distance: 150, //线条长度
      enable: true, //是否有线条
      opacity: 0.5, //线条透明度。
      width: 1, //线条宽度。
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: 'none',
      enable: true,
      outMode: 'bounce',
      random: false,
      speed: 2, //粒子运动速度。
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80, //粒子数量。
    },
    opacity: {
      value: 0.5, //粒子透明度。
    },
    shape: {
      type: 'circle', //可用的粒子外观类型有："circle","edge","triangle", "polygon","star"
    },
    size: {
      random: true,
      value: 5,
    },
  },
  detectRetina: true,
};
</script>

<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$light_gray: #eee;

/* reset element-ui css */
.login-container {
  .a-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;

      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }

  .a-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;

  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;

    &_login {
      font-size: 20px;
    }
  }

  .title {
    font-size: 26px;
    font-weight: 400;
    color: $light_gray;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: bold;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
