/**
 * 为不走 Vite auto-import 的 vitest 环境注入常用 Vue API，
 * 以便可直接 import 依赖 ref/reactive 的业务 config。
 */
import { computed, reactive, ref, watch } from 'vue';

Object.assign(globalThis, { ref, reactive, computed, watch });
